import type {
  CreateLambdaRoleOutput,
  IamServiceConfig,
} from './iam-service.types';
import {
  EntityAlreadyExistsException,
  IAMClient,
} from '@aws-sdk/client-iam';
import type {
  CreateRoleCommandOutput,
  GetRoleCommandOutput,
} from '@aws-sdk/client-iam';
import {
  AWS_MANAGED_POLICIES,
  LAMBDA_TRUST_POLICY,
} from './constants/aws-policies.constants';
import { CreateRoleCommand } from './commands/create-role-command';
import { AttachRolePolicyCommand } from './commands/attach-role-policy-command';
import { GetRoleCommand } from './commands/get-role-command';

export class IamService {
  private readonly client: IAMClient;
  private readonly lambdaTrustPolicy = LAMBDA_TRUST_POLICY;

  constructor(config: IamServiceConfig) {
    this.client = new IAMClient({ region: config.region });
  }

  /**
   * Create IAM role for Lambda execution
   */
  public async createLambdaExecutionRole(roleName: string): Promise<CreateLambdaRoleOutput> {
    const createRoleOutput: Partial<CreateLambdaRoleOutput> = {};
    let roleCommandOutput: CreateRoleCommandOutput | GetRoleCommandOutput | null = null;

    try {
      // Try to create the role
      const createRoleCommand = new CreateRoleCommand(this.client, {
        RoleName: roleName,
        AssumeRolePolicyDocument: JSON.stringify(this.lambdaTrustPolicy),
        Description: 'Lambda execution role for managing Route53 DNS records',
      });

      roleCommandOutput = await createRoleCommand.execute();
      createRoleOutput.createRoleCommand = createRoleCommand;

    } catch (error: unknown) {
      // If the error is not 'EntityAlreadyExists', rethrow it
      if (!(error instanceof EntityAlreadyExistsException)) {
        throw error;
      }
      // If the role already exists, fetch the existing role details
      const getRoleCommand = new GetRoleCommand(this.client, { RoleName: roleName });
      roleCommandOutput = await getRoleCommand.execute();
      createRoleOutput.getRoleCommand = getRoleCommand;
    }

    // Ensure the role ARN is present, otherwise undo and throw an error
    if (!roleCommandOutput?.Role?.Arn) {
      if (createRoleOutput.createRoleCommand) {
        await createRoleOutput.createRoleCommand.undo();
      }
      throw new Error('Unexpected role ARN is empty.');
    }

    // Store the role ARN in the output
    createRoleOutput.roleArn = roleCommandOutput.Role.Arn;

    try {
      // Attach the necessary policies to the role
      const attachPolicies = [
        new AttachRolePolicyCommand(this.client, {
          RoleName: roleName,
          PolicyArn: AWS_MANAGED_POLICIES.LAMBDA_BASIC_EXECUTION_ROLE,
        }),
        new AttachRolePolicyCommand(this.client, {
          RoleName: roleName,
          PolicyArn: AWS_MANAGED_POLICIES.ROUTE53_FULL_ACCESS,
        }),
      ];

      // Execute both policy attachment commands concurrently
      await Promise.all(attachPolicies.map(policy => policy.execute()));

      return createRoleOutput as CreateLambdaRoleOutput;

    } catch (error: unknown) {
      // Undo role creation if attaching policies fails
      if (createRoleOutput.createRoleCommand) {
        await createRoleOutput.createRoleCommand.undo();
      }
      throw error;
    }
  }
}
