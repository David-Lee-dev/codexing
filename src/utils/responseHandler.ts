import { Response } from '@/types/response';

export default class ResponseHandler {
  public static handle<T>(
    response: Response<T>,
    defaultValue: T | null = null,
  ): T | null {
    if (response.success) {
      return response.data ?? defaultValue;
    }

    throw new Error(response.message ?? 'Unknown error occurred');
  }
}
