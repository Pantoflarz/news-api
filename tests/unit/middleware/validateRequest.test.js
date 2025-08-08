const validateRequest = require('../../../middleware/validateRequest.js');
const { validationResult } = require('express-validator');

jest.mock('express-validator', () => ({
  validationResult: jest.fn()
}));

describe('validateRequest', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('returns 400 with errors if validation fails', () => {
    const fakeErrors = [{ msg: 'Invalid field' }];
    validationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => fakeErrors
    });

    validateRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      errors: fakeErrors
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next if there are no validation errors', () => {
    validationResult.mockReturnValue({
      isEmpty: () => true,
      array: () => []
    });

    validateRequest(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('returns the exact errors array from validationResult', () => {
    const fakeErrors = [
      { msg: 'Field A invalid', param: 'a' },
      { msg: 'Field B invalid', param: 'b' }
    ];
    validationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => fakeErrors
    });

    validateRequest(req, res, next);

    // check the exact errors array passed in JSON response
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      errors: fakeErrors
    }));
  });
});
