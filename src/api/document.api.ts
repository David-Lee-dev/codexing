import { Document } from '@/types/document';
import { Response } from '@/types/response';
import ResponseHandler from '@/utils/responseHandler';

import { invokeTauri } from './tauri-client';

export async function getDocument(
  documentId: string,
): Promise<Document | null> {
  const response = await invokeTauri<Response<Document>>('get_document', {
    documentId,
  });

  return ResponseHandler.handle<Document>(response);
}
