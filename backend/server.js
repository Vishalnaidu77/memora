import "dotenv/config.js";
import app from "./src/app.js";
import { connectToDb } from "./src/config/database.js";
import { initCollection } from "./src/service/qdrant.service.js";
import { resumePendingItemEnrichment } from "./src/service/item-processing.service.js";

const PORT = Number(process.env.PORT || 3001);

async function bootstrap() {
    await connectToDb();

    try {
        await initCollection();
    } catch (error) {
        console.warn(`Qdrant init failed: ${error.message}`);
    }

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);

        resumePendingItemEnrichment()
            .then((count) => {
                if (count) {
                    console.log(`Resumed pending item processing: ${count}`);
                }
            })
            .catch((error) => {
                console.error(`Failed to resume pending item processing: ${error.message}`);
            });
    });
}

bootstrap().catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
});
