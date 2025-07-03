const request = require("supertest");

describe("POST /auth/register", () => {

  const app = global.__APP__;

  describe("when missing API Key header", () => {
    test("fails to register due to missing API Key", async () => {
      const res = await request(app).post("/auth/register");
      expect(res.statusCode).toBe(500);
      expect(res.body).toMatchObject({"response": "Server error.", "status": "error"});
    });
  });
});
