import { Validator } from '../../lib/validator';
import { APIGatewayProxyEvent } from '../../lib/validator.types';

describe('Validator', () => {
  let validator: Validator;
  beforeEach(() => {
    validator = new Validator({
      validAuthToken: process.env.VALIDATOR_ACCESS_TOKEN as string,
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

  it('should throw an error if input is missing', () => {
    const invalidEvent: APIGatewayProxyEvent = {
      hostname: '',
      myip: '1.1.1.1',
      authToken: '',
    };

    expect(() => validator.validateEventInput(invalidEvent)).toThrow();
  });
});
