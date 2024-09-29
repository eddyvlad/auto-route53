import { Validator } from '../../src/services/validator';
import { APIGatewayProxyEvent } from '../../src/services/validator.types';

describe('Validator', () => {
  let validator: Validator;
  beforeEach(() => {
    validator = new Validator({
      validAuthToken: process.env.APP_AUTH_TOKEN!,
    });
  });

  it('should validate event input', () => {
    const validEvent: APIGatewayProxyEvent = {
      hostname: 'test-hostname',
      myip: '1.1.1.1',
      authToken: 'test-token',
    };

    expect(() => validator.validateEventInput(validEvent)).not.toThrow();
  });

  it('should reject invalid token', () => {
    const validEvent: APIGatewayProxyEvent = {
      hostname: 'test-hostname',
      myip: '1.1.1.1',
      authToken: 'fake-token',
    };

    expect(() => validator.validateEventInput(validEvent)).toThrow();
  });

  it('should throw an error if input is missing', () => {
    const invalidEvent: APIGatewayProxyEvent = {
      hostname: '',
      myip: '1.1.1.1',
      authToken: '',
    };

    expect(() => validator.validateEventInput(invalidEvent)).toThrow();
  });
});
