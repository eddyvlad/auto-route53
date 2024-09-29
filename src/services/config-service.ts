import * as dotenv from 'dotenv';
import type { ConfigOptions } from './config-service.types';
import type { ResourceRecordSet } from '@aws-sdk/client-route-53/dist-types/models/models_0';
import { LogLevel } from '../enums/log-level.enum';
import { DEFAULT_CONFIG } from '../constants/defaults.constant';

export class ConfigService {
  private readonly config: ConfigOptions;

  constructor(config?: ConfigOptions) {
    // Load from .env file if available
    dotenv.config();

    // Merge configurations with the following priority:
    // 1. Explicit config values passed to constructor.
    // 2. Environment variables from .env.
    this.config = {
      hostedZoneId: config?.hostedZoneId ?? process.env.ROUTE53_HOSTED_ZONE_ID,
      dnsRecordName: config?.dnsRecordName ?? process.env.ROUTE53_DNS_RECORD_NAME,
      dnsRecordTtl: config?.dnsRecordTtl ?? parseInt(process.env.ROUTE53_DNS_RECORD_TTL ?? DEFAULT_CONFIG.ROUTE53_DNS_RECORD_TTL),
      dnsRecordType: config?.dnsRecordType ?? process.env.ROUTE53_DNS_RECORD_TYPE as ResourceRecordSet['Type'],
      authToken: config?.authToken ?? process.env.APP_AUTH_TOKEN,
      logLevel: config?.logLevel ?? parseInt(process.env.APP_LOG_LEVEL ?? DEFAULT_CONFIG.APP_LOG_LEVEL) as LogLevel,
      lambdaAwsRegion: config?.lambdaAwsRegion ?? process.env.LAMBDA_AWS_REGION,
      lambdaFunctionName: config?.lambdaFunctionName ?? process.env.LAMBDA_FUNCTION_NAME,
      lambdaExecutionRoleName: config?.lambdaExecutionRoleName ?? process.env.LAMBDA_EXECUTION_ROLE_NAME,
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
    return this.config.dnsRecordTtl;
  }

  public getDnsRecordType(): ResourceRecordSet['Type'] {
    if (!this.config.dnsRecordType) throw new Error('dnsRecordType is not configured');
    return this.config.dnsRecordType;
  }

  public getAuthToken(): string {
    if (!this.config.authToken) throw new Error('authToken is not configured');
    return this.config.authToken;
  }

  public getLambdaAwsRegion(): string {
    if (!this.config.lambdaAwsRegion) throw new Error('lambdaAwsRegion is not configured');
    return this.config.lambdaAwsRegion;
  }

  public getLambdaExecutionRoleName(): string {
    if (!this.config.lambdaExecutionRoleName) throw new Error('lambdaExecutionRoleName is not configured');
    return this.config.lambdaExecutionRoleName;
  }

  public getLambdaFunctionName(): string {
    if (!this.config.lambdaFunctionName) throw new Error('lambdaFunctionName is not configured');
    return this.config.lambdaFunctionName;
  }

  public getLogLevel(): LogLevel {
    return this.config.logLevel;
  }
}
