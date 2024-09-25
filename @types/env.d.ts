declare namespace NodeJS {
  interface ProcessEnv {
    APP_AUTH_TOKEN: string;
    APP_LOG_LEVEL: string;
    ROUTE53_HOSTED_ZONE_ID: string;
    ROUTE53_DNS_RECORD_NAME: string;
    ROUTE53_DNS_RECORD_TYPE: string;
    ROUTE53_DNS_RECORD_TTL: string;
    LAMBDA_AWS_REGION: string;
    LAMBDA_FUNCTION_NAME: string;
    LAMBDA_EXECUTION_ROLE_NAME: string;
  }
}
