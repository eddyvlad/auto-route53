declare namespace NodeJS {
  interface ProcessEnv {
    HOSTED_ZONE_ID: string;
    DNS_RECORD_NAME: string;
    DNS_RECORD_TYPE: string;
    DNS_RECORD_TTL: string;
    LAMBDA_AWS_REGION: string;
    LAMBDA_FUNCTION_NAME: string;
    AUTH_TOKEN: string;
  }
}
