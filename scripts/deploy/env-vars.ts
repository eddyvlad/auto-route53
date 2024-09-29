import { configService } from './services';

export const getEnvVars = (): Record<string, string> => ({
  APP_LOG_LEVEL: String(configService.getLogLevel()),
  APP_AUTH_TOKEN: configService.getAuthToken(),
  ROUTE53_HOSTED_ZONE_ID: configService.getHostedZoneId(),
  ROUTE53_DNS_RECORD_NAME: configService.getDnsRecordName(),
  ROUTE53_DNS_RECORD_TTL: String(configService.getDnsRecordTtl()),
  ROUTE53_DNS_RECORD_TYPE: configService.getDnsRecordType() as string,
});
