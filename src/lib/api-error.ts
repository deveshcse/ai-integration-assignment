/**
 * Standardized API Error class.
 */
export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    // Set the prototype explicitly for built-in class extension in TS
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

