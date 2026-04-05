import { itemModel } from "../models/item.model.js"
import Clustering from "density-clustering"
import { generateTopicLabel } from "./ai.service.js"
import { getUserVectors } from "./qdrant.service.js"

const DBSCAN_EPS = 0.28
const DBSCAN_MIN_POINTS = 2

function normalizeVector(vector) {
    const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0))

    if (!magnitude) {
        return null
    }

    return vector.map(value => value / magnitude)
}

function cosineSimilarity(left, right) {
    let score = 0

    for (let index = 0; index < left.length; index++) {
        score += left[index] * right[index]
    }

    return score
}

function cosineDistance(left, right) {
    return 1 - cosineSimilarity(left, right)
}

function titleCase(value) {
    return value
        .split(/\s+/)
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

function buildFallbackClusterLabel(points) {
    const tagCounts = new Map()

    for (const point of points) {
        const tags = point.payload?.tags || []

        for (const rawTag of tags) {
            const tag = rawTag?.trim().toLowerCase()
            if (!tag) continue

            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
        }
    }

    if (tagCounts.size > 0) {
        const [topTag] = [...tagCounts.entries()].sort((a, b) => b[1] - a[1])[0]
        return titleCase(topTag)
    }

    const firstTitle = points.find(point => point.payload?.title)?.payload?.title
    if (firstTitle) {
        return firstTitle.split(/\s+/).slice(0, 3).join(' ')
    }

    return 'General'
}

function preparePoints(points) {
    return points
        .map(point => {
            const mongoId = point.payload?.mongoId
            const vector = Array.isArray(point.vector) ? point.vector : null
            const normalizedVector = vector ? normalizeVector(vector) : null

            if (!mongoId || !normalizedVector) {
                return null
            }

            return {
                ...point,
                mongoId,
                normalizedVector,
            }
        })
        .filter(Boolean)
}

function buildDbscanClusters(points) {
    const dataset = points.map(point => point.normalizedVector)
    const dbscan = new Clustering.DBSCAN()
    const clusterIndexes = dbscan.run(
        dataset,
        DBSCAN_EPS,
        DBSCAN_MIN_POINTS,
        cosineDistance
    )

    const clusters = clusterIndexes.map(indexes =>
        indexes.map(index => points[index])
    )

    const unclusteredItemIds = (dbscan.noise || []).map(index => points[index]?.mongoId).filter(Boolean)
    return { clusters, unclusteredItemIds }
}

export const clusterUserTopics = async (userId) => {
    const rawPoints = await getUserVectors(userId)
    const points = preparePoints(rawPoints)

    if (points.length < DBSCAN_MIN_POINTS) {
        await itemModel.updateMany(
            { userId },
            { $unset: { topicClusterId: "", topicLabel: "" } }
        )
        return []
    }

    const { clusters: groupedPoints, unclusteredItemIds } = buildDbscanClusters(points)
    const validGroupedPoints = groupedPoints.filter(clusterPoints => clusterPoints.length >= DBSCAN_MIN_POINTS)
    const clusters = await Promise.all(validGroupedPoints.map(async (clusterPoints, index) => {
        const aiLabel = await generateTopicLabel(clusterPoints)

        return {
            clusterId: `topic-${index + 1}`,
            topicLabel: aiLabel || buildFallbackClusterLabel(clusterPoints),
            itemIds: clusterPoints.map(point => point.mongoId),
            count: clusterPoints.length,
        }
    }))

    clusters.sort((left, right) => right.count - left.count)

    await itemModel.updateMany(
        { userId },
        { $unset: { topicClusterId: "", topicLabel: "" } }
    )

    for (const cluster of clusters) {
        await itemModel.updateMany(
            { _id: { $in: cluster.itemIds } },
            {
                $set: {
                    topicClusterId: cluster.clusterId,
                    topicLabel: cluster.topicLabel
                }
            }
        )
    }

    if (unclusteredItemIds.length > 0) {
        await itemModel.updateMany(
            { _id: { $in: unclusteredItemIds } },
            { $unset: { topicClusterId: "", topicLabel: "" } }
        )
    }

    return clusters
}
