import {
  GetRoleCommand as AWSGetRoleCommand,
  GetRoleCommandInput as AWSGetRoleCommandInput,
  GetRoleCommandOutput as AWSGetRoleCommandOutput,
  IAMClient,
} from '@aws-sdk/client-iam';
import { Command } from '../../../interfaces/command.interface';

export class GetRoleCommand implements Command {
  constructor(
    private readonly client: IAMClient,
    private readonly input: AWSGetRoleCommandInput,
  ) {
  }

  async execute(): Promise<AWSGetRoleCommandOutput> {
    return await this.client.send(new AWSGetRoleCommand(this.input));
  }

  async undo(): Promise<void> {
    // No need to undo
  }
}
