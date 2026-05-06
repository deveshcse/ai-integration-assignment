// Augments the Express Request interface to include a `user` property populated by the auth middleware.
declare namespace Express {
  interface Request {
    user?: {
      id: string;
      email: string;
    };
  }
}
