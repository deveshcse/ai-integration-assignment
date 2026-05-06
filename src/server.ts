// Entry point: loads env vars, calls connectDb(), then starts the Express HTTP server on the configured PORT.
import "dotenv/config";
import { app } from "./app.js";
import { connectDb } from "./db/connect.js";
import { logger } from "./lib/logger.js";

const PORT = process.env.PORT ?? "3000";

async function main(): Promise<void> {
  await connectDb();
  app.listen(Number(PORT), () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

main().catch((err: unknown) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});