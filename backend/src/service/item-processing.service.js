import { itemModel } from "../models/item.model.js";
import { enrichItem } from "./item-enrichment.service.js";

const activeItemProcessing = new Set();
const staleProcessingMs = Number(process.env.ITEM_PROCESSING_STALE_MS || 10 * 60 * 1000);

function getStaleProcessingDate() {
    return new Date(Date.now() - staleProcessingMs);
}

function needsSummaryBackfill(item) {
    return !String(item?.summary || "").trim()
}

function buildClaimFilter(itemId) {
    const staleDate = getStaleProcessingDate();

    return {
        _id: itemId,
        $or: [
            { status: { $in: ["queued", "failed"] } },
            { status: { $exists: false } },
            {
                status: "ready",
                $or: [
                    { summary: { $exists: false } },
                    { summary: null },
                    { summary: "" }
                ]
            },
            {
                status: "processing",
                $or: [
                    { lastProcessingAt: { $exists: false } },
                    { lastProcessingAt: null },
                    { lastProcessingAt: { $lte: staleDate } }
                ]
            }
        ]
    };
}

async function claimItemForProcessing(itemId) {
    return itemModel.findOneAndUpdate(
        buildClaimFilter(itemId),
        {
            $set: {
                status: "processing",
                processingError: null,
                lastProcessingAt: new Date()
            },
            $inc: {
                processingAttempts: 1
            }
        },
        {
            new: true
        }
    );
}

export async function processItemEnrichment(itemId) {
    const itemKey = itemId.toString();

    if (activeItemProcessing.has(itemKey)) {
        return {
            ok: true,
            skipped: true,
            reason: "already-processing-in-memory"
        };
    }

    activeItemProcessing.add(itemKey);

    try {
        const existingItem = await itemModel.findById(itemId);

        if (!existingItem) {
            return {
                ok: false,
                skipped: true,
                reason: "missing-item"
            };
        }

        if (
            existingItem.status === "ready"
            && (existingItem.tags?.length || existingItem.chromaId)
            && !needsSummaryBackfill(existingItem)
        ) {
            return {
                ok: true,
                skipped: true,
                reason: "already-ready"
            };
        }

        const item = await claimItemForProcessing(itemId);

        if (!item) {
            return {
                ok: true,
                skipped: true,
                reason: "claimed-elsewhere"
            };
        }

        try {
            const { tags, chromaId, summary } = await enrichItem(item);

            await itemModel.findByIdAndUpdate(itemId, {
                $set: {
                    tags,
                    chromaId,
                    summary,
                    status: "ready",
                    processingError: null,
                    lastProcessingAt: new Date()
                }
            });

            return {
                ok: true,
                skipped: false,
                reason: "completed"
            };
        } catch (error) {
            await itemModel.findByIdAndUpdate(itemId, {
                $set: {
                    status: "failed",
                    processingError: error.message,
                    lastProcessingAt: new Date()
                }
            });

            throw error;
        }
    } finally {
        activeItemProcessing.delete(itemKey);
    }
}

export function scheduleItemEnrichment(itemId) {
    const itemKey = itemId.toString();

    if (activeItemProcessing.has(itemKey)) {
        return false;
    }

    setTimeout(() => {
        processItemEnrichment(itemId).catch((error) => {
            console.error(`Local item processing failed for ${itemKey}:`, error.message);
        });
    }, 0);

    return true;
}

export async function resumePendingItemEnrichment(options = {}) {
    const limit = Number(options.limit || 100);
    const staleDate = getStaleProcessingDate();

    const pendingItems = await itemModel.find({
        $or: [
            { status: { $in: ["queued", "failed"] } },
            {
                status: "ready",
                $or: [
                    { summary: { $exists: false } },
                    { summary: null },
                    { summary: "" }
                ]
            },
            {
                status: "processing",
                $or: [
                    { lastProcessingAt: { $exists: false } },
                    { lastProcessingAt: null },
                    { lastProcessingAt: { $lte: staleDate } }
                ]
            }
        ]
    })
        .sort({ createdAt: 1 })
        .limit(limit)
        .select("_id");

    pendingItems.forEach((item) => {
        scheduleItemEnrichment(item._id);
    });

    return pendingItems.length;
}
