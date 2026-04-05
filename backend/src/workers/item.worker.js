import "dotenv/config.js";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { Worker } from "bullmq";
import { connectToDb } from "../config/database.js";
import { initCollection } from "../service/qdrant.service.js";
import {
    getRedisConnection,
    itemEnrichmentQueueName,
    startQueueMaintenance
} from "../service/queue.service.js";
import { processItemEnrichment } from "../service/item-processing.service.js";

let workerInstance = null;
let workerStartupPromise = null;

async function processEnrichmentJob(job) {
    const { itemId } = job.data;
    const result = await processItemEnrichment(itemId);

    if (result?.skipped) {
        console.log(`Worker skipped item ${itemId}: ${result.reason}`);
    } else {
        console.log(`Worker finished item: ${itemId}`);
    }
}

export async function startItemWorker(options = {}) {
    const {
        ensureInfrastructure = false,
        logReadyMessage = true
    } = options;

    if (workerInstance) {
        return workerInstance;
    }

    if (workerStartupPromise) {
        return workerStartupPromise;
    }

    workerStartupPromise = (async () => {
        if (ensureInfrastructure) {
            if (mongoose.connection.readyState === 0) {
                await connectToDb();
            }

            try {
                await initCollection();
            } catch (error) {
                console.warn(`Qdrant init failed for worker: ${error.message}`);
            }
        }

        await startQueueMaintenance();

        const worker = new Worker(itemEnrichmentQueueName, processEnrichmentJob, {
            connection: getRedisConnection(),
            concurrency: 1
        });

        worker.on("completed", job => {
            console.log(`Job completed: ${job.id}`);
        });

        worker.on("failed", (job, error) => {
            console.error(`Job failed: ${job?.id}`, error.message);
        });

        workerInstance = worker;

        if (logReadyMessage) {
            console.log("Item worker is running");
        }

        return worker;
    })();

    try {
        return await workerStartupPromise;
    } finally {
        workerStartupPromise = null;
    }
}

async function runAsStandaloneWorker() {
    try {
        await startItemWorker({
            ensureInfrastructure: true,
            logReadyMessage: true
        });
    } catch (error) {
        console.error("Failed to start item worker:", error.message);
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
}

const currentFilePath = fileURLToPath(import.meta.url);

if (process.argv[1] === currentFilePath) {
    runAsStandaloneWorker();
}
