import process from 'process';
import dotenv, { DotenvPopulateInput } from 'dotenv';

export default async () => {
  dotenv.populate(process.env as DotenvPopulateInput, {
    ROUTE53_HOSTED_ZONE_ID: 'ABC123',
    ROUTE53_DNS_RECORD_NAME: 'auto-route53.mydomain.com',
    ROUTE53_DNS_RECORD_TYPE: 'A',
    ROUTE53_DNS_RECORD_TTL: '300',
    LAMBDA_AWS_REGION: 'ap-southeast-1',
    LAMBDA_FUNCTION_NAME: 'my-lambda-function',
    APP_AUTH_TOKEN: 'test-token',
    APP_LOG_LEVEL: '0',
  }, {
    override: true,
  });
};
