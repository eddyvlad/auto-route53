export interface ValidatorConfig {
  validAuthToken: string;
}

export interface APIGatewayProxyEvent {
  hostname: string;
  myip: string;
  authToken: string;
}
