import { generateEmbedding, generateSummary, generateTags } from "./ai.service.js";
import { storeVector } from "./qdrant.service.js";

const STOP_WORDS = new Set([
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has",
    "in", "is", "it", "of", "on", "or", "that", "the", "this", "to", "was",
    "were", "will", "with", "into", "your", "you", "their", "they", "them",
    "our", "about", "after", "before", "than", "then", "over", "under",
    "can", "could", "should", "would", "have", "had", "not", "but", "now"
]);

function buildFallbackTags({ title, description, content, contentType }) {
    const sourceText = [title, description, content]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    const counts = new Map();
    const matches = sourceText.match(/[a-z][a-z0-9-]{2,}/g) || [];

    for (const word of matches) {
        if (STOP_WORDS.has(word)) continue;
        counts.set(word, (counts.get(word) || 0) + 1);
    }

    const rankedTags = [...counts.entries()]
        .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
        .map(([word]) => word)
        .filter((word, index, list) => list.indexOf(word) === index);

    const fallbackTags = rankedTags.slice(0, 5);

    if (!fallbackTags.length && contentType && contentType !== "other") {
        fallbackTags.push(contentType);
    }

    return fallbackTags;
}

function trimSummary(value, maxLength = 280) {
    const normalized = String(value || "").replace(/\s+/g, " ").trim()

    if (!normalized) {
        return ""
    }

    if (normalized.length <= maxLength) {
        return normalized
    }

    return `${normalized.slice(0, maxLength - 3).trim()}...`
}

function buildFallbackSummary({ title, description, content, contentType }) {
    const candidate = [description, content, title]
        .map((value) => trimSummary(value))
        .find(Boolean)

    if (candidate) {
        return candidate
    }

    if (contentType && contentType !== "other") {
        return `Saved ${contentType} ready for review.`
    }

    return "Saved item ready for review."
}

export async function enrichItem(item) {
    const title = item.title || "";
    const description = item.description || "";
    const content = item.content || "";
    const contentType = item.contentType || "other";
    const userId = item.userId.toString();
    const text = [title, description, content].filter(Boolean).join(". ");

    const [tagsRaw, embeddings, generatedSummary] = await Promise.all([
        generateTags(title, [description, content].filter(Boolean).join(". ")),
        generateEmbedding(text),
        generateSummary(title, description, content, contentType)
    ]);

    let tags = Array.isArray(tagsRaw)
        ? tagsRaw
            .filter(tag => typeof tag === "string")
            .map(tag => tag.trim())
            .filter(Boolean)
        : [];

    tags = [...new Set(tags)].slice(0, 5);

    if (!Array.isArray(tags) || tags.length === 0) {
        tags = buildFallbackTags({
            title,
            description,
            content,
            contentType
        });
    }

    const summary = trimSummary(generatedSummary) || buildFallbackSummary({
        title,
        description,
        content,
        contentType
    })

    let qdrantId = item.chromaId || null;

    if (embeddings) {
        try {
            qdrantId = await storeVector(
                item._id,
                embeddings,
                {
                    userId,
                    title,
                    tags, 
                    description,
                    contentType
                },
                userId
            );
        } catch (error) {
            console.warn(`Vector storage skipped for item ${item._id}: ${error.message}`);
            qdrantId = null;
        }
    }

    return {
        tags,
        chromaId: qdrantId,
        summary
    };
}
