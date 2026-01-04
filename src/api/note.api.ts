import { Note } from '@/types/note';

import { invokeTauri } from './tauri-client';

export async function saveNote(content: string, id?: string): Promise<Note> {
  return invokeTauri<Note>('save_note', { content, id });
}

export async function loadNotes(): Promise<Note[]> {
  return invokeTauri<Note[]>('load_notes');
}

export async function deleteNote(id: string): Promise<void> {
  return invokeTauri<void>('delete_note', { id });
}
