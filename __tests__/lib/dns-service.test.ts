import { DNSService } from '../../src/services/dns-service';
import { DNSServiceConfig } from '../../src/services/dns-service.types';
import {
  ChangeResourceRecordSetsCommand,
  ListResourceRecordSetsCommand,
} from '@aws-sdk/client-route-53';

// Mocking Route53Client and its send method
const mockSend = jest.fn(); // Create a mock function for send

jest.mock('@aws-sdk/client-route-53', () => {
  return {
    Route53Client: jest.fn(() => ({
      send: mockSend, // Use the mocked send function
    })),
    ChangeResourceRecordSetsCommand: jest.fn(),
    ListResourceRecordSetsCommand: jest.fn(),
  };
});

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
    mockSend.mockReset(); // Reset mock state before each test
  });

  it('should fetch the current DNS record', async () => {
    const mockResponse = {
      ResourceRecordSets: [
        { ResourceRecords: [{ Value: '1.1.1.1' }] },
      ],
    };

    // Mock the send method to resolve with mockResponse
    mockSend.mockResolvedValueOnce(mockResponse);

    const result = await dnsService.getCurrentRecord();
    expect(result).toBe('1.1.1.1');
    expect(ListResourceRecordSetsCommand).toHaveBeenCalled();
  });

  it('should update the DNS record', async () => {
    const mockResult = { ChangeInfo: { Status: 'PENDING' } };

    // Mock the send method to resolve with mockResult
    mockSend.mockResolvedValueOnce(mockResult);

    const result = await dnsService.updateDnsRecord('2.2.2.2');
    expect(result).toBe('PENDING');
    expect(ChangeResourceRecordSetsCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        ChangeBatch: expect.any(Object),
      }),
    );
  });
});
