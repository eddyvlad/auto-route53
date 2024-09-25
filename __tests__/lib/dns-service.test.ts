import { DNSService } from '../../src/services/dns-service';
import { DNSServiceConfig } from '../../src/services/dns-service.types';
import {
  Route53Client,
  ChangeResourceRecordSetsCommand,
  ListResourceRecordSetsCommand,
} from '@aws-sdk/client-route-53';

jest.mock('@aws-sdk/client-route-53', () => ({
  Route53Client: jest.fn(),
  ChangeResourceRecordSetsCommand: jest.fn(),
  ListResourceRecordSetsCommand: jest.fn(),
}));

describe('DNSService', () => {
  let dnsService: DNSService;
  let mockConfig: DNSServiceConfig;

  beforeEach(() => {
    mockConfig = {
      hostedZoneId: 'test-zone-id',
      dnsRecordName: 'test-domain.com',
      dnsRecordTtl: 300,
      dnsRecordType: 'A',
    };
    dnsService = new DNSService(mockConfig);
  });

  it('should fetch the current DNS record', async () => {
    const mockResponse = {
      ResourceRecordSets: [
        { ResourceRecords: [{ Value: '1.1.1.1' }] },
      ],
    };

    (Route53Client.prototype.send as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await dnsService.getCurrentRecord();
    expect(result).toBe('1.1.1.1');
    expect(ListResourceRecordSetsCommand).toHaveBeenCalled();
  });

  it('should update the DNS record', async () => {
    const mockResult = { ChangeInfo: { Status: 'PENDING' } };

    (Route53Client.prototype.send as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await dnsService.updateDnsRecord('2.2.2.2');
    expect(result).toBe('PENDING');
    expect(ChangeResourceRecordSetsCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        ChangeBatch: expect.any(Object),
      }),
    );
  });
});
