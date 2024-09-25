import * as dotenv from 'dotenv';
import type { ConfigOptions } from './config-service.types';
import type { ResourceRecordSet } from '@aws-sdk/client-route-53/dist-types/models/models_0';

export class ConfigService {
  private readonly config: ConfigOptions;

  constructor(config?: ConfigOptions) {
    // Load from .env file if available
    dotenv.config();

    // Merge configurations with the following priority:
    // 1. Explicit config values passed to constructor.
    // 2. Environment variables from .env.
    this.config = {
      hostedZoneId: config?.hostedZoneId || process.env.HOSTED_ZONE_ID,
      dnsRecordName: config?.dnsRecordName || process.env.DNS_RECORD_NAME,
      dnsRecordTtl: config?.dnsRecordTtl || parseInt(process.env.DNS_RECORD_TTL || '86400'),
      dnsRecordType: config?.dnsRecordType || process.env.DNS_RECORD_TYPE as ResourceRecordSet['Type'],
      authToken: config?.authToken || process.env.AUTH_TOKEN,
    };
  }

  public getHostedZoneId(): string {
    if (!this.config.hostedZoneId) throw new Error('hostedZoneId is not configured');
    return this.config.hostedZoneId;
  }

  public getDnsRecordName(): string {
    if (!this.config.dnsRecordName) throw new Error('dnsRecordName is not configured');
    return this.config.dnsRecordName;
  }

  /**
   * Defaults to 86400
   */
  public getDnsRecordTtl(): number {
    return this.config.dnsRecordTtl || 86400;
  }

  public getDnsRecordType(): ResourceRecordSet['Type'] {
    if (!this.config.dnsRecordType) throw new Error('dnsRecordType is not configured');
    return this.config.dnsRecordType;
  }

  public getAuthToken(): string {
    if (!this.config.authToken) throw new Error('authToken is not configured');
    return this.config.authToken;
  }
}
