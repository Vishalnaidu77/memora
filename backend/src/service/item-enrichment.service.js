import { generateEmbedding, generateTags } from "./ai.service.js";
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

export async function enrichItem(item) {
    const title = item.title || "";
    const description = item.description || "";
    const content = item.content || "";
    const contentType = item.contentType || "other";
    const userId = item.userId.toString();
    const text = [title, description, content].filter(Boolean).join(". ");

    const [tagsRaw, embeddings] = await Promise.all([
        generateTags(title, [description, content].filter(Boolean).join(". ")),
        generateEmbedding(text)
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

    let qdrantId = item.chromaId || null;

    if (embeddings) {
        try {
            qdrantId = await storeVector(
                item._id,
                embeddings,
                {
                    userId,
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
        chromaId: qdrantId
    };
}
