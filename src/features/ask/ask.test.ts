// Integration tests for the /api/ask endpoints using supertest and Node.js native test runner.
import "dotenv/config";
import { describe, it, before, after, mock } from "node:test";
import assert from "node:assert";
import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app.js";
import { embeddingsLib } from "../../lib/embeddings.js";
import { llmLib } from "../../lib/llm.js";

// ---------------------------------------------------------------------------
// Mocks using node:test
// ---------------------------------------------------------------------------

mock.method(embeddingsLib, "getEmbedding", async () => {
  return Array(1024).fill(0.1);
});

mock.method(llmLib, "chatCompletion", async () => {
  return '{"answer":"Meridian Technologies provides 20 days of annual leave per year.","sources":[],"confidence":"high"}';
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

process.env.JWT_SECRET ??= "test-jwt-secret-for-native-test";
process.env.JWT_EXPIRES_IN ??= "1h";
process.env.MONGODB_URI ??= "mongodb://localhost:27017/smart-qa-test";

async function getAuthToken(): Promise<string> {
  const email = `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
  const res = await request(app)
    .post("/api/auth/register")
    .send({ email, password: "password123" });
  return res.body.data.token as string;
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

before(async () => {
  const uri = (process.env.MONGODB_URI_TEST ?? process.env.MONGODB_URI)!;
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
});

after(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("POST /api/ask", () => {
  it("Test A — returns 401 when no Authorization header is provided", async () => {
    const res = await request(app)
      .post("/api/ask")
      .send({ question: "What is the annual leave policy?" });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  it("Test B — returns 200 with valid JWT and a well-formed question", async () => {
    const token = await getAuthToken();

    const res = await request(app)
      .post("/api/ask")
      .set("Authorization", `Bearer ${token}`)
      .send({ question: "What is the annual leave policy?" });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(typeof res.body.data.answer, "string");
    assert.strictEqual(Array.isArray(res.body.data.sources), true);
    assert.ok(["high", "medium", "low"].includes(res.body.data.confidence));
  });

  it("Test C — returns 400 when question is too short (< 3 chars)", async () => {
    const token = await getAuthToken();

    const res = await request(app)
      .post("/api/ask")
      .set("Authorization", `Bearer ${token}`)
      .send({ question: "ab" });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });
});

describe("GET /api/ask/history", () => {
  it("Test D — returns 200 with an array of history items for authenticated user", async () => {
    const token = await getAuthToken();

    const res = await request(app)
      .get("/api/ask/history")
      .set("Authorization", `Bearer ${token}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(Array.isArray(res.body.data), true);
  });
});
