import {
  ChangeResourceRecordSetsCommand,
  ListResourceRecordSetsCommand,
  Route53Client,
} from '@aws-sdk/client-route-53';
import type { DNSServiceConfig } from './dns-service.types';
import { ResourceRecordSet } from '@aws-sdk/client-route-53/dist-types/models/models_0';

export class DNSService {
  private route53Client: Route53Client;
  private readonly hostedZoneId: string;
  private readonly dnsRecordName: string;
  private readonly dnsRecordTtl: number;
  private readonly dnsRecordType: ResourceRecordSet['Type'];

  constructor(config: DNSServiceConfig) {
    this.route53Client = new Route53Client({});
    this.hostedZoneId = config.hostedZoneId;
    this.dnsRecordName = config.dnsRecordName;
    this.dnsRecordTtl = config.dnsRecordTtl;
    this.dnsRecordType = config.dnsRecordType;
  }

  /**
   * Fetch the current DNS record from Route 53
   */
  public async getCurrentRecord(): Promise<string | null> {
    try {
      const listCommand = new ListResourceRecordSetsCommand({
        HostedZoneId: this.hostedZoneId,
        StartRecordName: this.dnsRecordName,
      });
      const result = await this.route53Client.send(listCommand);

      if (
        !result.ResourceRecordSets ||
        result.ResourceRecordSets.length === 0 ||
        !result.ResourceRecordSets[0].ResourceRecords ||
        result.ResourceRecordSets[0].ResourceRecords.length === 0
      ) {
        return null;
      }

      return result.ResourceRecordSets[0].ResourceRecords[0].Value || null;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error fetching current record: ${error.message}`);
      }
      throw new Error('Unknown error occurred while fetching the current record');
    }
  }

  /**
   * Update the DNS record in Route 53
   * @param newIp
   */
  public async updateDnsRecord(newIp: string): Promise<string | undefined> {
    try {
      const changeCommand = new ChangeResourceRecordSetsCommand({
        HostedZoneId: this.hostedZoneId,
        ChangeBatch: {
          Changes: [
            {
              Action: 'UPSERT',
              ResourceRecordSet: {
                Name: this.dnsRecordName,
                Type: this.dnsRecordType,
                ResourceRecords: [
                  {
                    Value: newIp,
                  },
                ],
                TTL: this.dnsRecordTtl,
              },
            },
          ],
        },
      });

      const results = await this.route53Client.send(changeCommand);
      return results.ChangeInfo?.Status;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error updating DNS record: ${error.message}`);
      }
      throw new Error('Unknown error occurred while updating DNS record');
    }
  }
}
