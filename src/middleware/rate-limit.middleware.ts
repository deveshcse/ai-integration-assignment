import { Request } from "express";
import rateLimit, { Store } from "express-rate-limit";
import MongoStore from "rate-limit-mongo";

const windowMs = 1 * 60 * 1000;

const mongoRateLimitStore = new MongoStore({
  uri: process.env.MONGODB_URI,
  expireTimeMs: windowMs,
  collectionName: "rateLimitRecords",
  errorHandler: (error: unknown) => {
    console.error("[RATE_LIMIT] Mongo store error:", error);
  },
});

export const askRateLimiter = rateLimit({
  windowMs,
  max: 10,
  store: mongoRateLimitStore as unknown as Store,
  keyGenerator: (req: Request) => {
    return (req as any).user?.id || (req.ip ?? req.socket.remoteAddress ?? "unknown");
  },
  validate: {
    keyGeneratorIpFallback: false, // disables the IPv6 helper warning
  },
  message: {
    success: false,
    error: "Too many requests. Please try again after a minute.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});