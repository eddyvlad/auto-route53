import type { ResourceRecordSet } from '@aws-sdk/client-route-53/dist-types/models/models_0';

export interface ConfigOptions {
  logLevel: number;
  hostedZoneId: string;
  dnsRecordName: string;
  dnsRecordTtl: number;
  dnsRecordType: ResourceRecordSet['Type'];
  authToken: string;
  lambdaAwsRegion: string;
  lambdaFunctionName: string;
  lambdaExecutionRoleName: string;
}
