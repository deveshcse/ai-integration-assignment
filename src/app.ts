// Creates and configures the Express app: registers global middleware (helmet, cors, pino-http, json parser) and mounts feature routers.
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { errorHandler } from "./middleware/error.middleware.js";
import swaggerUi from "swagger-ui-express";
import { authRouter } from "./features/auth/auth.routes.js";
import { docsRouter } from "./features/docs/docs.routes.js";
import { askRouter } from "./features/ask/ask.routes.js";
import { logger } from "./lib/logger.js";
import { swaggerSpec } from "./lib/swagger.js";

export const app = express();

// Global middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url?.startsWith("/api-docs") || false,
    },
    // Simplified logging: exclude bulky headers and remote addresses
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
        id: req.id,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),
    },
  })
);

// Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Feature routers
app.use("/api/auth", authRouter);
app.use("/api/docs", docsRouter);
app.use("/api/ask", askRouter);

// Global error handler — must be registered last
app.use(errorHandler);
