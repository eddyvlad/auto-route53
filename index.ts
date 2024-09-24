import {
  ChangeResourceRecordSetsCommand,
  ListResourceRecordSetsCommand,
  Route53Client,
} from '@aws-sdk/client-route-53';

const route53Client = new Route53Client({});
const HOSTED_ZONE_ID = 'Z1VQO4Z6X3T4XC';
const DNS_RECORD_NAME = 'diskstation.eddyhidayat.com.';

type DdnsEvent = {
  hostname: string;
  myip: string;
};

// Helper function to validate inputs
const validateEventInput = (event: DdnsEvent): void => {
  const {
    hostname,
    myip,
  } = event;
  if (!hostname || !myip) {
    throw new Error('Please provide hostname and IP');
  }
};

// Helper function to get the current DNS record
const getCurrentRecord = async (): Promise<string | null> => {
  try {
    const listCommand = new ListResourceRecordSetsCommand({
      HostedZoneId: HOSTED_ZONE_ID,
      StartRecordName: DNS_RECORD_NAME,
    });
    const result = await route53Client.send(listCommand);

    // Check if ResourceRecordSets is defined and contains at least one entry
    if (
      !result.ResourceRecordSets ||
      result.ResourceRecordSets.length === 0 ||
      !result.ResourceRecordSets[0].ResourceRecords ||
      result.ResourceRecordSets[0].ResourceRecords.length === 0
    ) {
      return null;
    }

    // Safely return the first record's value
    return result.ResourceRecordSets[0].ResourceRecords[0].Value || null;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Error fetching current record: ${error.message}`);
    }
    throw new Error('Unknown error occurred while fetching the current record');
  }
};

// Helper function to update the DNS record
const updateDnsRecord = async (newIp: string): Promise<string | undefined> => {
  try {
    const changeCommand = new ChangeResourceRecordSetsCommand({
      HostedZoneId: HOSTED_ZONE_ID,
      ChangeBatch: {
        Changes: [{
          Action: 'UPSERT',
          ResourceRecordSet: {
            Name: DNS_RECORD_NAME,
            Type: 'A',
            ResourceRecords: [{
              Value: newIp,
            }],
            TTL: 86400,
          },
        }],
      },
    });

    const results = await route53Client.send(changeCommand);
    return results.ChangeInfo?.Status;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Error updating DNS record: ${error.message}`);
    }
    throw new Error('Unknown error occurred while updating DNS record');
  }
};

// Main handler function
// noinspection JSUnusedGlobalSymbols
export const handler = async (event: DdnsEvent) => {
  try {
    validateEventInput(event);

    const { myip: newIp } = event;
    console.log(`Requesting change of RecordSet ${DNS_RECORD_NAME} to new IP: ${newIp}`);

    // Get the current DNS record value
    const currentIp = await getCurrentRecord();
    console.log(`Current IP for ${DNS_RECORD_NAME}: ${currentIp}`);

    // Only update if the IP has changed
    if (currentIp !== newIp) {
      const status = await updateDnsRecord(newIp);
      console.log(`Successfully changed recordSet to ${newIp}. Status: ${status}`);

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          status: status,
        }),
      };
    } else {
      console.log(`No change required, IP is already ${newIp}`);
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'No change required',
        }),
      };
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: error.message,
        }),
      };
    }

    console.error('Unknown error occurred');
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        error: 'Unknown error occurred',
      }),
    };
  }
};
