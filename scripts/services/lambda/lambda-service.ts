import * as fs from 'node:fs';
import {
  CreateFunctionCommand,
  GetFunctionCommand,
  GetFunctionCommandOutput,
  LambdaClient,
  ResourceNotFoundException,
  UpdateFunctionCodeCommand,
  UpdateFunctionConfigurationCommand,
} from '@aws-sdk/client-lambda';
import type {
  CreateLambdaInput,
  LambdaServiceConfig,
  UpdateLambdaCodeInput,
  UpdateLambdaEnvironmentInput,
} from './lambda-service.types';
import { Logger } from '../../../src/interfaces/logger.interface';

export class LambdaService {
  private lambdaClient: LambdaClient;
  private readonly logger: Logger;

  constructor(config: LambdaServiceConfig) {
    this.logger = config.logger;
    this.lambdaClient = new LambdaClient({ region: config.region });
  }

  /**
   * Create a Lambda function
   *
   * @param input
   * @param envVars
   */
  public async createLambdaFunction(input: CreateLambdaInput, envVars: Record<string, string>): Promise<void> {
    try {
      const createFunctionResponse = await this.lambdaClient.send(new CreateFunctionCommand({
        FunctionName: input.functionName,
        Role: input.roleArn,
        Runtime: input.runtime,
        Handler: input.handler || 'index.handler',
        Code: {
          ZipFile: fs.readFileSync(input.zipFilePath),
        },
        Environment: {
          Variables: envVars,
        },
      }));

      this.logger.log('Lambda function created:', createFunctionResponse.FunctionArn);
    } catch (error) {
      this.logger.error('Error creating Lambda function:', error);
      throw error;
    }
  }

  /**
   * Update Lambda code
   * @param input
   */
  public async updateLambdaCode(input: UpdateLambdaCodeInput): Promise<void> {
    try {
      const updateCodeResponse = await this.lambdaClient.send(new UpdateFunctionCodeCommand({
        FunctionName: input.functionName,
        ZipFile: fs.readFileSync(input.zipFilePath),
      }));
      this.logger.log('Lambda code updated:', updateCodeResponse.FunctionArn);
    } catch (error) {
      this.logger.error('Error updating Lambda code:', error);
      throw error;
    }
  }

  /**
   * Update Lambda environment variables
   * @param input
   * @param envVars
   */
  public async updateLambdaEnvironment(input: UpdateLambdaEnvironmentInput, envVars: Record<string, string>): Promise<void> {
    try {
      const updateEnvResponse = await this.lambdaClient.send(new UpdateFunctionConfigurationCommand({
        FunctionName: input.functionName,
        Environment: {
          Variables: envVars,
        },
      }));
      this.logger.log('Lambda environment variables updated:', updateEnvResponse.FunctionArn);
    } catch (error) {
      this.logger.error('Error updating Lambda environment:', error);
      throw error;
    }
  }

  /**
   * Get Lambda function details
   * @param functionName The Lambda function name
   * @returns null if the function is not found.
   */
  public async getLambdaFunction(functionName: string): Promise<GetFunctionCommandOutput | null> {
    try {
      const command = new GetFunctionCommand({ FunctionName: functionName });
      return await this.lambdaClient.send(command);
    } catch (error: unknown) {
      if (error instanceof ResourceNotFoundException) {
        return null;
      }

      this.logger.error('Error getLambdaFunction:', error);
      throw error;
    }
  }
}
