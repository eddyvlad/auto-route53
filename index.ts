import { Validator } from './lib/validator';
import { Logger } from './lib/logger';
import { DNSService } from './lib/dns-service';
import { ConfigService } from './lib/config-service';
import { ResponseService } from './lib/response-service';
import type { APIGatewayProxyEvent } from './lib/validator.types';

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const configService = new ConfigService();
    const validator = new Validator({
      validAuthToken: configService.getAuthToken(),
    });
    // Validate the input event
    validator.validateEventInput(event);

    const { myip: newIp } = event;
    Logger.log(`Requesting change of RecordSet to new IP: ${newIp}`);

    // Pass the configuration to DNSService
    const dnsService = new DNSService({
      hostedZoneId: configService.getHostedZoneId(),
      dnsRecordName: configService.getDnsRecordName(),
      dnsRecordTtl: configService.getDnsRecordTtl(),
      dnsRecordType: configService.getDnsRecordType(),
    });

    // Get the current DNS record value
    const currentIp = await dnsService.getCurrentRecord();
    Logger.log(`Current IP for the DNS record: ${currentIp}`);

    // Only update if the IP has changed
    if (currentIp !== newIp) {
      const status = await dnsService.updateDnsRecord(newIp);
      Logger.log(`Successfully changed recordSet from ${currentIp} to ${newIp}. Status: ${status}`);
      return ResponseService.success('DNS record updated successfully', { status: status || 200 });
    } else {
      Logger.log(`No change required, IP is already ${newIp}`);
      return ResponseService.success('No change required');
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      Logger.error(`Error: ${error.message}`);
      return ResponseService.error(error.message);
    }

    Logger.error('Unknown error occurred');
    return ResponseService.error('Unknown error occurred');
  }
};
