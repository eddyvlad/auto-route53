export interface Command {
  execute(): Promise<unknown>;

  undo(): Promise<unknown>;
}
