/* eslint-disable @typescript-eslint/no-unsafe-function-type,@typescript-eslint/no-explicit-any */
export const withErrorHandling = (fn: Function, logger: any) => {
  return async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      logger.error(`Error in ${fn.name}:`, error);
      throw error;
    }
  };
};
