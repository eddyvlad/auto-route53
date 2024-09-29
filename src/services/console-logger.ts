/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-argument */
import { Logger } from '../interfaces/logger.interface';
import { LogLevel } from '../enums/log-level.enum';

export class ConsoleLogger implements Logger {
  private static logLevel: LogLevel = LogLevel.INFO;

  constructor(private readonly context?: string) {}

  public static setLogLevel(level: LogLevel) {
    ConsoleLogger.logLevel = level;
  }

  public log(message: string, ...optionalParams: any[]) {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.getMessage(message), ...optionalParams);
    }
  }

  public error(message: string, ...optionalParams: any[]) {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.getMessage(message), ...optionalParams);
    }
  }

  public warn(message: string, ...optionalParams: any[]) {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.getMessage(message), ...optionalParams);
    }
  }

  public debug(message: string, ...optionalParams: any[]) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.getMessage(message), ...optionalParams);
    }
  }

  public info(message: string, ...optionalParams: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.getMessage(message), ...optionalParams);
    }
  }

  // Determines if the current log level allows this message to be logged
  private shouldLog(level: LogLevel): boolean {
    return level >= ConsoleLogger.logLevel;
  }

  private getMessage(message: string): string {
    return this.context ? `[${this.context}] ${message}` : message;
  }
}
