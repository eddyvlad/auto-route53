import { Logger } from '../../../src/interfaces/logger.interface';
import { Runtime } from '@aws-sdk/client-lambda';

export interface LambdaServiceConfig {
  region: string;
  functionName: string;
  logger: Logger;
}

export interface CreateLambdaInput {
  roleArn: string;
  zipFilePath: string;
  runtime: Runtime;
  handler?: string;
}

export interface UpdateLambdaCodeInput {
  zipFilePath: string;
}
