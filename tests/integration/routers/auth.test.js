const request = require("supertest");

describe("POST /auth/register", () => {

  const app = global.__APP__;

  describe("when missing API Key header", () => {
    test("fails to register due to missing body fields", async () => {
      const res = await request(app).post("/auth/register");

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body).toHaveProperty('errors');
    });
  });
});
