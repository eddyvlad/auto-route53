import {
  CreateRoleCommandInput as AWSCreateRoleCommandInput,
  CreateRoleCommand as AWSCreateRoleCommand,
  CreateRoleCommandOutput as AWSCreateRoleCommandOutput,
  DeleteRoleCommandOutput as AWSDeleteRoleCommandOutput,
  IAMClient,
  DeleteRoleCommand,
} from '@aws-sdk/client-iam';
import { Command } from '../../../interfaces/command.interface';

export class CreateRoleCommand implements Command {
  constructor(
    private readonly client: IAMClient,
    private readonly input: AWSCreateRoleCommandInput,
  ) {
  }

  async execute(): Promise<AWSCreateRoleCommandOutput> {
    return await this.client.send(new AWSCreateRoleCommand(this.input));
  }

  async undo(): Promise<AWSDeleteRoleCommandOutput> {
    return await this.client.send(new DeleteRoleCommand({
      RoleName: this.input.RoleName,
    }));
  }
}
