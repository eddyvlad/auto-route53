import * as fs from 'node:fs';
import { services } from './services';
import {
  DEPLOYMENT_ZIP_NAME,
  LAMBDA_RUNTIME,
} from '../constants/shared.constants';
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
      runtime: LAMBDA_RUNTIME,
    }, getEnvVars());
  } catch (error) {
    logger.error('Error creating Lambda function:', error);
    if (createRoleResult.createRoleCommand) {
      await createRoleResult.createRoleCommand.undo();
    }
  }
};

const areEnvVarsEqual = (envVar1: Record<string, string>, envVar2: Record<string, string>): boolean => {
  // Check if both objects have the same number of keys
  const keys1 = Object.keys(envVar1);
  const keys2 = Object.keys(envVar2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  // Check if all keys and values are the same
  for (const key of keys1) {
    if (envVar1[key] !== envVar2[key]) {
      return false;
    }
  }

  return true;
};

const updateLambda = async (zipFilePath: string) => {
  // Determine if environment variables needs updating
  const lambdaFunction = await lambdaService.getLambdaFunction();
  const existingEnvVars = lambdaFunction?.Configuration?.Environment?.Variables;
  const newEnvVars = getEnvVars();
  if (existingEnvVars && !areEnvVarsEqual(existingEnvVars, newEnvVars)) {
    logger.info('Updating Lambda Environment Variables');
    await lambdaService.updateLambdaEnvironment(newEnvVars);

    logger.info('Waiting for Lambda Environment Variables to be updated...');
    await lambdaService.waitUntilFunctionUpdated();
  } else {
    logger.info('No changes to Environment Variables');
  }

  logger.info('Updating Lambda Code');
  await lambdaService.updateLambdaCode(zipFilePath);
  await lambdaService.waitUntilFunctionUpdated();
  logger.info('Lambda Code update completed');
};

const deployLambda = async (zipFilePath: string) => {
  if (!fs.existsSync(zipFilePath)) {
    logger.error(`Unable to find ${zipFilePath}. Please run 'npm run zip'`);
    return;
  }

  let shouldCreateLambda = false;
  try {
    const lambdaFunction = await lambdaService.getLambdaFunction();
    if (!lambdaFunction) {
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

deployLambda(DEPLOYMENT_ZIP_NAME).catch((error) => {
  logger.error('Error deploying Lambda function:', error);
});
