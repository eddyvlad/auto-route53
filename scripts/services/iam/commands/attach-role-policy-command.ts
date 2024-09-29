import {
  AttachRolePolicyCommand as AWSAttachRolePolicyCommand,
  AttachRolePolicyCommandInput as AWSAttachRolePolicyCommandInput,
  AttachRolePolicyCommandOutput as AWSAttachRolePolicyCommandOutput,
  DetachRolePolicyCommand as AWSDetachRolePolicyCommand,
  DetachRolePolicyCommandOutput as AWSDetachRolePolicyCommandOutput,
  IAMClient,
} from '@aws-sdk/client-iam';
import { Command } from '../../../interfaces/command.interface';

export class AttachRolePolicyCommand implements Command {
  constructor(
    private readonly client: IAMClient,
    private readonly input: AWSAttachRolePolicyCommandInput
  ) {}

  public async execute(): Promise<AWSAttachRolePolicyCommandOutput> {
    return this.client.send(new AWSAttachRolePolicyCommand(this.input));
  }

  async undo(): Promise<AWSDetachRolePolicyCommandOutput> {
    return this.client.send(
      new AWSDetachRolePolicyCommand({
        RoleName: this.input.RoleName,
        PolicyArn: this.input.PolicyArn,
      })
    );
  }
}
