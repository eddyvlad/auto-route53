import * as Path from 'node:path';
import dotenv, { DotenvPopulateInput } from 'dotenv';

export default async () => {
  dotenv.config({
    path: Path.resolve(__dirname, '../../.env.defaults'),
  });
  dotenv.populate(process.env as DotenvPopulateInput, {
    ROUTE53_HOSTED_ZONE_ID: 'ABC123',
    ROUTE53_DNS_RECORD_NAME: 'auto-route53.mydomain.com',
    APP_AUTH_TOKEN: 'test-token',
    APP_LOG_LEVEL: '5',
  }, {
    override: true,
  });
};
