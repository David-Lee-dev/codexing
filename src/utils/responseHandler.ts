import { Response } from '@/types/response';

export default class ResponseHandler {
  public static handle<T>(response: Response<T>): T {
    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message ?? 'Unknown error occurred');
  }
}
