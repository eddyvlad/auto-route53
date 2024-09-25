// deploy.ts
import { services } from './services';
import {
  DEPLOYMENT_ZIP_NAME,
  LAMBDA_RUNTIME,
} from '../constants/shared.constants';
import * as fs from 'node:fs';
import { getEnvVars } from './env-vars';

const {
  logger,
  lambdaService,
  iamService,
  configService,
} = services;

const createLambda = async (zipFilePath: string) => {
  const createRoleResult = await iamService.createLambdaExecutionRole(configService.getLambdaExecutionRoleName());
  try {
    await lambdaService.createLambdaFunction({
      roleArn: createRoleResult.roleArn,
      zipFilePath,
      functionName: configService.getLambdaFunctionName(),
      runtime: LAMBDA_RUNTIME,
    }, getEnvVars());
  } catch (error) {
    logger.error('Error creating Lambda function:', error);
    if (createRoleResult.createRoleCommand) {
      await createRoleResult.createRoleCommand.undo();
    }
  }
};

const updateLambda = async (zipFilePath: string) => {
  await lambdaService.updateLambdaCode({
    functionName: configService.getLambdaFunctionName(),
    zipFilePath,
  });
  await lambdaService.updateLambdaEnvironment({
    functionName: configService.getLambdaFunctionName(),
  }, getEnvVars());
};

const deployLambda = async (zipFilePath: string) => {
  if (!fs.existsSync(zipFilePath)) {
    logger.error(`Unable to find ${zipFilePath}. Please run 'npm run zip'`);
    return;
  }

  let shouldCreateLambda = false;
  try {
    const lambdaFunctionOutput = await lambdaService.getLambdaFunction(configService.getLambdaFunctionName());
    if (!lambdaFunctionOutput) {
      logger.warn(`Lambda function [${configService.getLambdaFunctionName()}] not found`);
      logger.info('Creating it now');
      shouldCreateLambda = true;
    } else {
      await updateLambda(zipFilePath);
    }
  } catch (error) {
    logger.error('Error deploying Lambda code', error);
  }

  if (shouldCreateLambda) {
    try {
      await createLambda(zipFilePath);
    } catch (error) {
      logger.error('Error creating Lambda function', error);
    }
  }
};

deployLambda(DEPLOYMENT_ZIP_NAME);
