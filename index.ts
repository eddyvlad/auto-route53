import { Validator } from './src/services/validator';
import { ConsoleLogger } from './src/services/console-logger';
import { DNSService } from './src/services/dns-service';
import { ConfigService } from './src/services/config-service';
import { ResponseService } from './src/services/response-service';
import type { APIGatewayProxyEvent } from './src/services/validator.types';

export const handler = async (event: APIGatewayProxyEvent) => {
  const configService = new ConfigService();
  ConsoleLogger.setLogLevel(configService.getLogLevel());
  const logger = new ConsoleLogger('handler');

  try {
    const validator = new Validator({
      validAuthToken: configService.getAuthToken(),
    });
    // Validate the input event
    validator.validateEventInput(event);

    const { myip: newIp } = event;
    logger.info(`Requesting change of RecordSet to new IP: ${newIp}`);

    // Pass the configuration to DNSService
    const dnsService = new DNSService({
      hostedZoneId: configService.getHostedZoneId(),
      dnsRecordName: configService.getDnsRecordName(),
      dnsRecordTtl: configService.getDnsRecordTtl(),
      dnsRecordType: configService.getDnsRecordType(),
    });

    // Get the current DNS record value
    const currentIp = await dnsService.getCurrentRecord();
    logger.info(`Current IP for the DNS record: ${currentIp}`);

    // Only update if the IP has changed
    if (currentIp !== newIp) {
      const status = await dnsService.updateDnsRecord(newIp);
      logger.info(`Successfully changed recordSet from ${currentIp} to ${newIp}. Status: ${status}`);
      return ResponseService.success('DNS record updated successfully', { status: status || 200 });
    } else {
      logger.info(`No change required, IP is already ${newIp}`);
      return ResponseService.success('No change required');
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Error: ${error.message}`);
      return ResponseService.error(error.message);
    }

    logger.error('Unknown error occurred');
    return ResponseService.error('Unknown error occurred');
  }
};
