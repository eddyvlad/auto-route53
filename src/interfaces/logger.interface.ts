/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Logger {
  log: (message: string, ...optionalParams: any[]) => void;
  error: (message: string, ...optionalParams: any[]) => void;
  warn: (message: string, ...optionalParams: any[]) => void;
  debug: (message: string, ...optionalParams: any[]) => void;
  info: (message: string, ...optionalParams: any[]) => void;
}
