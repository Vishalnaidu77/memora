import { Queue } from "bullmq";
import Redis from "ioredis";

export const itemEnrichmentQueueName = "item-enrichment";

const redisConfig = {
    host: process.env.REDIS_HOST || process.env.REDIS_HOSTNAME || "127.0.0.1",
    port: Number(process.env.REDIS_PORT || 6379),
    username: process.env.REDIS_USERNAME || undefined,
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.REDIS_TLS === "true" ? {} : undefined,
    maxRetriesPerRequest: null
};

export const redisConnection = new Redis(redisConfig);

export const itemEnrichmentQueue = new Queue(itemEnrichmentQueueName, {
    connection: redisConnection,
    defaultJobOptions: {            // Default rules for every job
        attempts: 3,
        backoff: {                  // retries wait time before retrying again
            type: "exponential", 
            delay: 2000
        },
        removeOnComplete: 50,
        removeOnFail: 100
    }
});

export async function enqueueItemEnrichment({ itemId, userId }) {
    return itemEnrichmentQueue.add("enrich-item", {
        itemId: itemId.toString(),
        userId: userId.toString(),
        jobType: "enrich-item",
        requestedAt: Date.now()
    });
}
