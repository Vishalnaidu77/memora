import { Queue } from "bullmq";
import Redis from "ioredis";

export const itemEnrichmentQueueName = "item-enrichment";

const queuePrefix = process.env.BULLMQ_PREFIX || "memora";
const completedAgeSeconds = Number(process.env.BULLMQ_COMPLETED_TTL_SECONDS || 3600);
const completedMaxCount = Number(process.env.BULLMQ_COMPLETED_MAX_COUNT || 100);
const failedAgeSeconds = Number(process.env.BULLMQ_FAILED_TTL_SECONDS || 86400);
const failedMaxCount = Number(process.env.BULLMQ_FAILED_MAX_COUNT || 200);

const redisConfig = {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT || 16395),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null
};

let redisConnectionInstance = null;
let itemEnrichmentQueueInstance = null;

function getQueueOptions() {
    return {
        prefix: queuePrefix,
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 2000
            },
            removeOnComplete: {
                age: completedAgeSeconds,
                count: completedMaxCount
            },
            removeOnFail: {
                age: failedAgeSeconds,
                count: failedMaxCount
            }
        }
    };
}

export function getRedisConnection() {
    if (!redisConnectionInstance) {
        redisConnectionInstance = new Redis(redisConfig);
    }

    return redisConnectionInstance;
}

export function getItemEnrichmentQueue() {
    if (!itemEnrichmentQueueInstance) {
        itemEnrichmentQueueInstance = new Queue(itemEnrichmentQueueName, {
            connection: getRedisConnection(),
            ...getQueueOptions()
        });
    }

    return itemEnrichmentQueueInstance;
}

let maintenanceIntervalId = null;

export async function runQueueMaintenance() {
    const completedGraceMs = Number(process.env.BULLMQ_CLEAN_COMPLETED_GRACE_MS || 3600000);
    const failedGraceMs = Number(process.env.BULLMQ_CLEAN_FAILED_GRACE_MS || 86400000);
    const maxCleanBatch = Number(process.env.BULLMQ_CLEAN_BATCH_SIZE || 1000);
    const itemEnrichmentQueue = getItemEnrichmentQueue();

    const [completed, failed] = await Promise.all([
        itemEnrichmentQueue.clean(completedGraceMs, maxCleanBatch, "completed"),
        itemEnrichmentQueue.clean(failedGraceMs, maxCleanBatch, "failed")
    ]);

    return {
        removedCompleted: completed.length,
        removedFailed: failed.length
    };
}

export async function startQueueMaintenance() {
    if (maintenanceIntervalId) {
        return maintenanceIntervalId;
    }

    const intervalMs = Number(process.env.BULLMQ_MAINTENANCE_INTERVAL_MS || 900000);
    if (!Number.isFinite(intervalMs) || intervalMs <= 0) {
        return null;
    }

    try {
        const result = await runQueueMaintenance();
        if (result.removedCompleted || result.removedFailed) {
            console.log(
                `Queue maintenance removed completed=${result.removedCompleted}, failed=${result.removedFailed}`
            );
        }
    } catch (error) {
        console.warn(`Queue maintenance failed: ${error.message}`);
    }

    maintenanceIntervalId = setInterval(async () => {
        try {
            const result = await runQueueMaintenance();
            if (result.removedCompleted || result.removedFailed) {
                console.log(
                    `Queue maintenance removed completed=${result.removedCompleted}, failed=${result.removedFailed}`
                );
            }
        } catch (error) {
            console.warn(`Queue maintenance failed: ${error.message}`);
        }
    }, intervalMs);

    if (typeof maintenanceIntervalId.unref === "function") {
        maintenanceIntervalId.unref();
    }

    return maintenanceIntervalId;
}

export async function enqueueItemEnrichment({ itemId, userId }) {
    const itemEnrichmentQueue = getItemEnrichmentQueue();

    return itemEnrichmentQueue.add("enrich-item", {
        itemId: itemId.toString(),
        userId: userId.toString(),
        jobType: "enrich-item",
        requestedAt: Date.now()
    }, {
        jobId: itemId.toString()
    });
}
