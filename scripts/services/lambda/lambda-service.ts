import * as fs from 'node:fs';
import {
  CreateFunctionCommand,
  GetFunctionCommand,
  GetFunctionCommandOutput,
  LambdaClient,
  ResourceNotFoundException,
  UpdateFunctionCodeCommand,
  UpdateFunctionConfigurationCommand,
  waitUntilFunctionUpdated,
} from '@aws-sdk/client-lambda';
import { WaiterResult } from '@smithy/util-waiter';
import type { CreateLambdaInput, LambdaServiceConfig } from './lambda-service.types';
import { Logger } from '../../../src/interfaces/logger.interface';

export class LambdaService {
  private lambdaClient: LambdaClient;
  private readonly logger: Logger;
  private readonly functionName: string;

  constructor(config: LambdaServiceConfig) {
    this.logger = config.logger;
    this.lambdaClient = new LambdaClient({ region: config.region });
    this.functionName = config.functionName;
  }

  /**
   * Create a Lambda function
   *
   * @param input
   * @param envVars
   */
  public async createLambdaFunction(input: CreateLambdaInput, envVars: Record<string, string>): Promise<void> {
    try {
      const createFunctionResponse = await this.lambdaClient.send(
        new CreateFunctionCommand({
          FunctionName: this.functionName,
          Role: input.roleArn,
          Runtime: input.runtime,
          Handler: input.handler ?? 'index.handler',
          Code: {
            ZipFile: fs.readFileSync(input.zipFilePath),
          },
          Environment: {
            Variables: envVars,
          },
        })
      );

      this.logger.log('Lambda function created:', createFunctionResponse.FunctionArn);
    } catch (error) {
      this.logger.error('Error creating Lambda function:', error);
      throw error;
    }
  }

  /**
   * Update Lambda code
   * @param zipFilePath
   */
  public async updateLambdaCode(zipFilePath: string): Promise<void> {
    try {
      const updateCodeResponse = await this.lambdaClient.send(
        new UpdateFunctionCodeCommand({
          FunctionName: this.functionName,
          ZipFile: fs.readFileSync(zipFilePath),
        })
      );
      this.logger.log('Lambda code updated:', updateCodeResponse.FunctionArn);
    } catch (error) {
      this.logger.error('Error updating Lambda code:', error);
      throw error;
    }
  }

  /**
   * Update Lambda environment variables
   * @param envVars
   */
  public async updateLambdaEnvironment(envVars: Record<string, string>): Promise<void> {
    try {
      const updateEnvResponse = await this.lambdaClient.send(
        new UpdateFunctionConfigurationCommand({
          FunctionName: this.functionName,
          Environment: {
            Variables: envVars,
          },
        })
      );
      this.logger.log('Lambda environment variables updated:', updateEnvResponse.FunctionArn);
    } catch (error) {
      this.logger.error('Error updating Lambda environment:', error);
      throw error;
    }
  }

  /**
   * Get Lambda function details
   * @returns null if the function is not found.
   */
  public async getLambdaFunction(): Promise<GetFunctionCommandOutput | null> {
    try {
      const command = new GetFunctionCommand({ FunctionName: this.functionName });
      return await this.lambdaClient.send(command);
    } catch (error: unknown) {
      if (error instanceof ResourceNotFoundException) {
        return null;
      }

      this.logger.error('Error getLambdaFunction:', error);
      throw error;
    }
  }

  public async waitUntilFunctionUpdated(): Promise<WaiterResult> {
    return waitUntilFunctionUpdated(
      {
        client: this.lambdaClient,
        maxWaitTime: 60,
      },
      {
        FunctionName: this.functionName,
      }
    );
  }
}
