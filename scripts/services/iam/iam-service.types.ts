import { CreateRoleCommand } from './commands/create-role-command';
import { GetRoleCommand } from './commands/get-role-command';

export interface IamServiceConfig {
  region: string;
}

export interface CreateLambdaRoleOutput {
  createRoleCommand?: CreateRoleCommand;
  getRoleCommand?: GetRoleCommand;
  roleArn: string;
}
