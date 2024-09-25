export class Logger {
  public static log(message: string): void {
    console.log(message);
  }

  public static error(message: string): void {
    console.error(message);
  }
}
