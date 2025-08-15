const request = require('supertest');
const crypto = require('crypto');

describe('/auth/register E2E', () => {
  let app;

  beforeAll(() => {
    app = global.__APP__;
  });

  describe('POST /auth/register', () => {

    it('should return validation errors for missing or invalid fields', async () => {
      const invalidUsers = [
        {
          user: { name: '', email: '', password: '' },
          expectedErrors: ['Name is required', 'Email is required', 'Password is required']
        },
        {
          user: { name: 'ab', email: 'not-an-email', password: 'short' },
          expectedErrors: [
            'Name must be between 3-32 characters',
            'Invalid email address',
            'Password must be at least 6 characters',
            'Password must contain a number',
            'Password must contain an uppercase letter',
            'Password must contain a special character'
          ]
        },
        {
          user: { name: 'ValidName', email: 'user@example.com', password: 'NoNumber!' },
          expectedErrors: ['Password must contain a number']
        },
        {
          user: { name: 'AnotherName', email: 'user2@example.com', password: 'nonumbers1' },
          expectedErrors: ['Password must contain an uppercase letter', 'Password must contain a special character']
        }
      ];

      for (const { user, expectedErrors } of invalidUsers) {
        const res = await request(app).post('/auth/register').send(user);

        expect(res.statusCode).toBe(400);
        expect(res.body.status).toBe('error');
        expect(Array.isArray(res.body.response)).toBe(true);

        const messages = res.body.response.map(err => err.msg);
        expectedErrors.forEach(expectedMsg => {
          expect(messages).toContain(expectedMsg);
        });
      }
    });

    it('should register a new user successfully', async () => {
      const user = generateRandomUser();

      const res = await request(app)
        .post('/auth/register')
        .send(user);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('OK');
      expect(res.body.response).toBe('success');
    });

    it('should fail when trying to register an already existing user', async () => {
      const user = generateRandomUser();

      //first registration
      await request(app).post('/auth/register').send(user);

      //attempt duplicate registration with the same details
      const res = await request(app)
        .post('/auth/register')
        .send(user);

      expect(res.statusCode).toBe(500);
      expect(res.body.status).toBe('error');
      expect(res.body.response).toBe('Something went wrong. Try again later.');
    });

  });
});

function generateRandomUser() {
  const username = randomAlphaString(12); //letters only
  const randomSuffix = crypto.randomBytes(4).toString('hex'); //small unique string for email
  return {
    name: username,
    email: `${username}${randomSuffix}@example.com`,
    password: 'Aa1!password'
  };
}

function randomAlphaString(length) {
  const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return result;
}
