import {
  LambdaClient,
  UpdateFunctionConfigurationCommand,
} from '@aws-sdk/client-lambda';
import * as dotenv from 'dotenv';

dotenv.config();

const lambdaClient = new LambdaClient({ region: process.env.AWS_REGION });

// Fetch environment variables from .env
const functionName = process.env.LAMBDA_FUNCTION_NAME;
const hostedZoneId = process.env.HOSTED_ZONE_ID;
const dnsRecordName = process.env.DNS_RECORD_NAME;
const dnsRecordTtl = process.env.DNS_RECORD_TTL;
const authToken = process.env.AUTH_TOKEN;

if (!functionName || !hostedZoneId || !dnsRecordName || !dnsRecordTtl || !authToken) {
  throw new Error('Missing required environment variables. Please check your .env file.');
}

const updateLambdaConfiguration = async () => {
  /**
   * aws lambda update-function-configuration \
   *   --function-name your-lambda-function-name \
   *   --environment "Variables={HOSTED_ZONE_ID=Z1VQO4Z6X3T4XC,DNS_RECORD_NAME=diskstation.eddyhidayat.com.,DNS_RECORD_TTL=86400,AUTH_TOKEN=23324}"
   */
  try {
    const updateConfigCommand = new UpdateFunctionConfigurationCommand({
      FunctionName: functionName,
      Environment: {
        Variables: {
          HOSTED_ZONE_ID: hostedZoneId,
          DNS_RECORD_NAME: dnsRecordName,
          DNS_RECORD_TTL: dnsRecordTtl,
          AUTH_TOKEN: authToken,
        },
      },
    });

    const result = await lambdaClient.send(updateConfigCommand);
    console.log(`Successfully updated function configuration: ${result.FunctionName}`);
  } catch (error) {
    console.error(`Failed to update function configuration: ${error}`);
  }
};

updateLambdaConfiguration();
