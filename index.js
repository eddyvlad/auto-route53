import { Route53Client, ListResourceRecordSetsCommand, ChangeResourceRecordSetsCommand } from "@aws-sdk/client-route-53";

const route53Client = new Route53Client({});

const HOSTED_ZONE_ID = 'Z1VQO4Z6X3T4XC';
const DNS_RECORD_NAME = 'diskstation.eddyhidayat.com.';

export const handler = async (event) => {
    const hostname = event.hostname;
    const newIp = event.myip;

    if (!hostname || !newIp) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                success: false,
                error: 'Please provide hostname and ip',
            }),
        };
    }

    console.log(`Requesting change of RecordSet ${DNS_RECORD_NAME}`);
    console.log(`Hostname:`, hostname);
    console.log(`NewIp:`, newIp);

    let recordSets;
    try {
        const listCommand = new ListResourceRecordSetsCommand({
            HostedZoneId: HOSTED_ZONE_ID,
            StartRecordName: DNS_RECORD_NAME,
        });
        recordSets = await route53Client.send(listCommand);
    } catch (e) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                success: false,
                error: e.message,
            }),
        };
    }

    const diskstationValue = recordSets.ResourceRecordSets[0].ResourceRecords[0].Value;

    if (diskstationValue !== newIp) {
        const newRecord = {
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
        };

        console.log(`Changing recordSet ${DNS_RECORD_NAME} from ${diskstationValue} to ${newIp}`);

        let results;
        try {
            const changeCommand = new ChangeResourceRecordSetsCommand(newRecord);
            results = await route53Client.send(changeCommand);
        } catch (e) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    success: false,
                    error: e.message,
                }),
            };
        }

        if (results.ChangeInfo.Status === 'PENDING') {
            console.log(`Successfully changed recordSet`);
        } else {
            console.log(`Status returned`, results);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                status: results.ChangeInfo.Status,
            }),
        };
    }

    console.log(`No change required`);
    return {
        statusCode: 200,
        body: JSON.stringify({
            success: true,
            message: 'No change required',
        }),
    };
};
