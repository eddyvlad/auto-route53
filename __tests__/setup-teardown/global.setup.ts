import process from 'process';
import dotenv, { DotenvPopulateInput } from 'dotenv';

export default async () => {
  dotenv.populate(process.env as DotenvPopulateInput, {
    HOSTED_ZONE_ID: 'ABC123',
    DNS_RECORD_NAME: 'auto-route53.mydomain.com',
    DNS_RECORD_TYPE: 'A',
    DNS_RECORD_TTL: '300',
    LAMBDA_AWS_REGION: 'ap-southeast-1',
    LAMBDA_FUNCTION_NAME: 'my-lambda-function',
    AUTH_TOKEN: 'test-token',
  }, {
    override: true,
  });
};
