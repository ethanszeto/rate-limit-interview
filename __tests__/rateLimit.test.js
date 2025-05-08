import request from "supertest";
import server from "../index.js";
import { Database } from "../.database/database.js";

beforeEach(() => {
  Database.collections = {};
});

describe("Rate Limiting Middleware", () => {
  const sendRequest = async (userId) => {
    return request(server).post("/request").send({ user_id: userId });
  };

  test("Allows 10 requests from same user", async () => {
    for (let i = 0; i < 10; i++) {
      const res = await sendRequest("user-A");
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Endpoint Hit");
    }
  });

  test("Blocks 11th request from same user", async () => {
    for (let i = 0; i < 10; i++) {
      await sendRequest("user-B");
    }
    const res = await sendRequest("user-B");
    expect(res.statusCode).toBe(429);
    expect(res.body.error).toBe("Rate limit exceeded");
  });

  test("Blocks 11th request across different users", async () => {
    const userSequence = ["user-1", "user-2", "user-3", "user-4", "user-5", "user-6", "user-7", "user-8", "user-9", "user-10"];

    for (const userId of userSequence) {
      const res = await sendRequest(userId);
      expect(res.statusCode).toBe(200);
    }

    const res = await sendRequest("user-11");
    expect(res.statusCode).toBe(429);
    expect(res.body.error).toBe("Rate limit exceeded");
  });
});
