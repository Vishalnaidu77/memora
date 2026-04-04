import { generateEmbedding, generateTags } from "./ai.service.js";
import { storeVector } from "./qdrant.service.js";

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
        ? tagsRaw.filter(tag => typeof tag === "string")
        : [];

    if (!Array.isArray(tags) || tags.length === 0) {
        tags = [];
    }

    let qdrantId = item.chromaId || null;

    if (embeddings) {
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
    }

    return {
        tags,
        chromaId: qdrantId
    };
}
