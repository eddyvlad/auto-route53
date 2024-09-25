// services.ts
import { ConfigService } from '../../src/services/config-service';
import { ConsoleLogger } from '../../src/services/console-logger';
import { LambdaService } from '../services/lambda/lambda-service';
import { IamService } from '../services/iam/iam-service';

export const configService = new ConfigService();
ConsoleLogger.setLogLevel(configService.getLogLevel());

export const services = {
  logger: new ConsoleLogger('deploy'),
  lambdaService: new LambdaService({
    region: configService.getLambdaAwsRegion(),
    logger: new ConsoleLogger('LambdaService'),
  }),
  iamService: new IamService({
    region: configService.getLambdaAwsRegion(),
    logger: new ConsoleLogger('IamService'),
  }),
  configService,
};
