const { validationResult } = require('express-validator');
const {
  registerPostValidation,
  loginPostValidation
} = require('../../../validators/authValidator.js');

describe('registerPostValidation', () => {
  let req;

  beforeEach(() => {
    req = { body: {} };
  });

  it('fails if name is missing', async () => {
    const result = await runValidator(registerPostValidation, req);
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].msg).toBe('Name is required');
  });

  it('fails if email is missing', async () => {
    req.body = { name: 'John' };
    const result = await runValidator(registerPostValidation, req);
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].msg).toBe('Email is required');
  });

  it('fails if password is missing', async () => {
    req.body = { name: 'John', email: 'test@example.com' };
    const result = await runValidator(registerPostValidation, req);
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].msg).toBe('Password is required');
  });

  it('fails if email is invalid', async () => {
    req.body = { name: 'John', email: 'invalid', password: 'Password1!' };
    const result = await runValidator(registerPostValidation, req);
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].msg).toBe('Invalid email address');
  });

  it('fails if password does not meet complexity requirements', async () => {
    req.body = { name: 'John', email: 'test@example.com', password: 'abc' };
    const result = await runValidator(registerPostValidation, req);
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].msg).toBe('Password must be at least 6 characters');
  });

  it('passes with valid data', async () => {
    req.body = { name: 'John', email: 'test@example.com', password: 'Password1!' };
    const result = await runValidator(registerPostValidation, req);
    expect(result.isEmpty()).toBe(true);
  });
});

describe('loginPostValidation', () => {
  let req;

  beforeEach(() => {
    req = { body: {} };
  });

  it('fails if email is missing', async () => {
    const result = await runValidator(loginPostValidation, req);
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].msg).toBe('Email is required');
  });

  it('fails if password is missing', async () => {
    req.body = { email: 'test@example.com' };
    const result = await runValidator(loginPostValidation, req);
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].msg).toBe('Password is required');
  });

  it('fails if email is invalid', async () => {
    req.body = { email: 'invalid', password: 'Password1' };
    const result = await runValidator(loginPostValidation, req);
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].msg).toBe('Invalid email address');
  });

  it('fails if password is too short', async () => {
    req.body = { email: 'test@example.com', password: '123' };
    const result = await runValidator(loginPostValidation, req);
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].msg).toBe('Password must be at least 6 characters');
  });

  it('passes with valid data', async () => {
    req.body = { email: 'test@example.com', password: 'Password1' };
    const result = await runValidator(loginPostValidation, req);
    expect(result.isEmpty()).toBe(true);
  });
});

const runValidator = async (validators, req) => {
  for (const validator of validators) {
    await validator.run(req);
  }
  return validationResult(req);
};
