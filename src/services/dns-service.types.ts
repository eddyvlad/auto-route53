import { ResourceRecordSet } from '@aws-sdk/client-route-53/dist-types/models/models_0';

export interface DNSServiceConfig {
  hostedZoneId: string;
  dnsRecordName: string;
  dnsRecordTtl: number;
  dnsRecordType: ResourceRecordSet['Type'];
}
