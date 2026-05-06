declare module "rate-limit-mongo" {
  interface MongoStoreOptions {
    uri?: string;
    user?: string;
    password?: string;
    authSource?: string;
    collectionName?: string;
    expireTimeMs?: number;
    resetExpireDateOnChange?: boolean;
    createTtlIndex?: boolean;
    errorHandler?: (error: unknown) => void;
  }

  class MongoStore {
    constructor(options?: MongoStoreOptions);
  }

  export default MongoStore;
}
