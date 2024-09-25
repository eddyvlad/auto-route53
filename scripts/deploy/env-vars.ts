import { configService } from './services';

export const getEnvVars = (): Record<string, string> => ({
  APP_AUTH_TOKEN: configService.getAuthToken(),
  LAMBDA_FUNCTION_NAME: configService.getLambdaFunctionName(),
  ROUTE53_HOSTED_ZONE_ID: configService.getHostedZoneId(),
  ROUTE53_DNS_RECORD_NAME: configService.getDnsRecordName(),
  ROUTE53_DNS_RECORD_TTL: String(configService.getDnsRecordTtl()),
});
