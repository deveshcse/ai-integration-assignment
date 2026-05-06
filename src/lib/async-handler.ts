import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an async RequestHandler to catch errors and pass them to next().
 * This allows handlers to throw errors or reject promises without manual try/catch.
 */
export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
