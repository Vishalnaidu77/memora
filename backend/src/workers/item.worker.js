import "dotenv/config.js";
import { Worker } from "bullmq";
import mongoose from "mongoose";
import { connectToDb } from "../config/database.js";
import { itemModel } from "../models/item.model.js";
import { initCollection } from "../service/qdrant.service.js";
import { itemEnrichmentQueueName, redisConnection } from "../service/queue.service.js";
import { enrichItem } from "../service/item-enrichment.service.js";

async function processEnrichmentJob(job) {
    const { itemId } = job.data;

    const item = await itemModel.findById(itemId);
    if (!item) {
        console.log(`Worker skipped missing item: ${itemId}`);
        return;
    }

    if (item.status === "ready" && (item.tags?.length || item.chromaId)) {
        console.log(`Worker skipped already processed item: ${itemId}`);
        return;
    }

    await itemModel.findByIdAndUpdate(itemId, {
        $set: {
            status: "processing",
            processingError: null,
            lastProcessingAt: new Date(e)
        },
        $inc: {
            processingAttempts: 1
        }
    });

    try {
        const { tags, chromaId } = await enrichItem(item);

        await itemModel.findByIdAndUpdate(itemId, {
            $set: {
                tags,
                chromaId,
                status: "ready",
                processingError: null,
                lastProcessingAt: new Date()
            }
        });

        console.log(`Worker finished item: ${itemId}`);
    } catch (error) {
        await itemModel.findByIdAndUpdate(itemId, {
            $set: {
                status: "failed",
                processingError: error.message,
                lastProcessingAt: new Date()
            }
        });

        console.error(`Worker failed item ${itemId}:`, error.message);
        throw error;
    }
}

async function startWorker() {
    await connectToDb();
    await initCollection();

    const worker = new Worker(itemEnrichmentQueueName, processEnrichmentJob, {
        connection: redisConnection,
        concurrency: 1
    });

    worker.on("completed", job => {
        console.log(`Job completed: ${job.id}`);
    });

    worker.on("failed", (job, error) => {
        console.error(`Job failed: ${job?.id}`, error.message);
    });

    console.log("Item worker is running");
}

startWorker().catch(error => {
    console.error("Failed to start item worker:", error.message);
    if (mongoose.connection.readyState !== 0) {
        mongoose.connection.close();
    }
    process.exit(1);
});
