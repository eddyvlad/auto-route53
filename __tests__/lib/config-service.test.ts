import { ConfigService } from '../../src/services/config-service';
import { ConfigOptions } from '../../src/services/config-service.types';

describe('ConfigService', () => {
  it('should load configuration from .env', () => {
    process.env.ROUTE53_HOSTED_ZONE_ID = 'test-zone-id';
    process.env.ROUTE53_DNS_RECORD_NAME = 'test-domain.com';
    process.env.ROUTE53_DNS_RECORD_TTL = '300';
    process.env.ROUTE53_DNS_RECORD_TYPE = 'A';
    process.env.APP_AUTH_TOKEN = 'test-token';

    const configService = new ConfigService();

    expect(configService.getHostedZoneId()).toBe('test-zone-id');
    expect(configService.getDnsRecordName()).toBe('test-domain.com');
    expect(configService.getDnsRecordTtl()).toBe(300);
    expect(configService.getDnsRecordType()).toBe('A');
    expect(configService.getAuthToken()).toBe('test-token');
  });

  it('should override config from env', () => {
    const mockConfig: Partial<ConfigOptions> = {
      hostedZoneId: 'json-zone-id',
      dnsRecordName: 'json-domain.com',
      dnsRecordTtl: 600,
      dnsRecordType: 'CNAME',
      authToken: 'json-token',
    };

    const configService = new ConfigService(mockConfig as ConfigOptions);
    expect(configService.getHostedZoneId()).toBe('json-zone-id');
    expect(configService.getDnsRecordName()).toBe('json-domain.com');
    expect(configService.getDnsRecordTtl()).toBe(600);
    expect(configService.getDnsRecordType()).toBe('CNAME');
    expect(configService.getAuthToken()).toBe('json-token');
  });
});
