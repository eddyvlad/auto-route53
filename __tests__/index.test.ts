import { handler } from '../index';
import { Route53Client } from '@aws-sdk/client-route-53';

// Mock the Route53 client
jest.mock('@aws-sdk/client-route-53');

const mockRoute53Client = Route53Client as jest.MockedClass<typeof Route53Client>;

describe('DDNS handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return error when hostname or IP is missing', async () => {
    const event = {
      hostname: '',
      myip: '',
      authToken: '',
    };

    const result = await handler(event);
    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        error: "Please provide 'hostname', 'myip', 'authToken'",
      }),
    });
  });

  it('should not update DNS if IP has not changed', async () => {
    const event = {
      hostname: 'my-nas',
      myip: '1.2.3.4',
      authToken: 'test-token',
    };

    // Mock the getCurrentRecord function to return the same IP
    mockRoute53Client.prototype.send = jest.fn().mockResolvedValue({
      ResourceRecordSets: [
        {
          ResourceRecords: [{ Value: '1.2.3.4' }],
        },
      ],
    });

    const result = await handler(event);

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'No change required',
      }),
    });
  });

  it('should update DNS if IP has changed', async () => {
    const event = {
      hostname: 'my-nas',
      myip: '4.3.2.1',
      authToken: 'test-token',
    };

    // Mock the getCurrentRecord function to return a different IP
    mockRoute53Client.prototype.send = jest
      .fn()
      .mockResolvedValueOnce({
        ResourceRecordSets: [
          {
            ResourceRecords: [{ Value: '1.2.3.4' }],
          },
        ],
      }) // First call returns the current IP
      .mockResolvedValueOnce({
        ChangeInfo: { Status: 'PENDING' },
      }); // Second call returns the DNS update status

    const result = await handler(event);

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'DNS record updated successfully',
        status: 'PENDING',
      }),
    });
  });

  it('should handle errors from Route53', async () => {
    const event = {
      hostname: 'my-nas',
      myip: '4.3.2.1',
      authToken: 'test-token',
    };

    // Mock Route53 client to throw an error
    mockRoute53Client.prototype.send = jest.fn().mockRejectedValue(new Error('Route53 Error'));

    const result = await handler(event);

    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        error: 'Error fetching current record: Route53 Error',
      }),
    });
  });
});
