export class ResponseService {
  public static success(message: string, additionalData: Record<string, number | string> = {}) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message,
        ...additionalData,
      }),
    };
  }

  public static error(errorMessage: string, statusCode: number = 400) {
    return {
      statusCode,
      body: JSON.stringify({
        success: false,
        error: errorMessage,
      }),
    };
  }
}
