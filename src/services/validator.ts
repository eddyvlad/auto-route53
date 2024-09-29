import type {
  APIGatewayProxyEvent,
  ValidatorConfig,
} from './validator.types';

export class Validator {
  constructor(private readonly config: ValidatorConfig) {
  }

  public validateEventInput(event: APIGatewayProxyEvent): void {
    const checkValues: (keyof APIGatewayProxyEvent)[] = ['hostname', 'myip', 'authToken'];
    const errorFields: string[] = [];

    checkValues.forEach((valueKey) => {
      if (!event[valueKey]) {
        errorFields.push(valueKey);
      }
    });

    if (errorFields.length > 0) {
      throw new Error(`Please provide '${errorFields.join('\', \'')}'`);
    }

    if (event.authToken !== this.config.validAuthToken) {
      throw new Error('Unauthorized');
    }
  }
}
