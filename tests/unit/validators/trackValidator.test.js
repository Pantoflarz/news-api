const { validationResult } = require('express-validator');
const { trackValidator } = require('../../../validators/trackValidator.js');
const Article = require('../../../models/Article.js');

jest.mock('../../../models/Article.js');

describe('trackValidator', () => {
  let req;

  beforeEach(() => {
    req = { body: {} };
    jest.clearAllMocks();
  });

  it('fails if articleID is missing entirely', async () => {
    const result = await runValidator(trackValidator, req);

    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].msg).toBe('articleID is required');
  });

  it('fails if articleID is an empty string', async () => {
    req.body = { articleID: '' };

    const result = await runValidator(trackValidator, req);

    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].msg).toBe('articleID is required');
  });

  it('fails if articleID does not exist in DB', async () => {
    req.body = { articleID: 'abc123' };
    Article.findOne.mockResolvedValue(null);

    const result = await runValidator(trackValidator, req);

    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].msg).toBe('Invalid articleID provided in request.');
    expect(Article.findOne).toHaveBeenCalledWith({ _id: 'abc123' });
  });

  it('passes if articleID exists in DB', async () => {
    req.body = { articleID: 'abc123' };
    Article.findOne.mockResolvedValue({ _id: 'abc123' });

    const result = await runValidator(trackValidator, req);

    expect(result.isEmpty()).toBe(true);
    expect(Article.findOne).toHaveBeenCalledWith({ _id: 'abc123' });
  });
});

const runValidator = async (validators, req) => {
  for (const validator of validators) {
    await validator.run(req);
  }
  return validationResult(req);
};
