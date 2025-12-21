import { invoke } from '@tauri-apps/api/core';
import { Note } from '../types/note';

export interface AppConfig {
  storage_path: string | null;
  is_onboarding_complete: boolean;
}

const STORAGE_KEY = 'memo_app_notes';

/**
 * Fetches the app configuration from the backend.
 */
export async function getConfig(): Promise<AppConfig> {
  try {
    return await invoke<AppConfig>('get_config');
  } catch (error) {
    console.error('Failed to fetch config:', error);
    // Return default config on error
    return {
      storage_path: null,
      is_onboarding_complete: false,
    };
  }
}

/**
 * Saves a note to the local file system.
 * If id is null, creates a new note.
 * Currently using localStorage mock until Tauri commands are implemented.
 */
export async function saveNote(content: string, id?: string): Promise<Note> {
  // Mock implementation using localStorage
  return new Promise((resolve) => {
    setTimeout(() => {
      const notes = loadNotesFromStorage();
      const now = new Date().toISOString();
      const title = extractTitle(content);

      let savedNote: Note;

      if (id) {
        // Update existing note
        const index = notes.findIndex((n) => n.id === id);
        if (index >= 0) {
          savedNote = {
            ...notes[index],
            content,
            updated_at: now,
            title,
          };
          notes[index] = savedNote;
        } else {
          // ID exists but note not found, create new
          savedNote = {
            id,
            content,
            created_at: now,
            updated_at: now,
            title,
          };
          notes.push(savedNote);
        }
      } else {
        // Create new note
        savedNote = {
          id: crypto.randomUUID(),
          content,
          created_at: now,
          updated_at: now,
          title,
        };
        notes.push(savedNote);
      }

      saveNotesToStorage(notes);
      console.log('[Mock] Saved note:', savedNote.id);
      resolve(savedNote);
    }, 100); // Simulate minimal delay
  });
}

/**
 * Loads all notes from the local file system.
 * Currently using localStorage mock until Tauri commands are implemented.
 */
export async function loadNotes(): Promise<Note[]> {
  // Mock implementation using localStorage
  return Promise.resolve(loadNotesFromStorage());
}

/**
 * Helper: Load notes from localStorage
 */
function loadNotesFromStorage(): Note[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored) as Note[];
  } catch (error) {
    console.error('[Mock] Failed to load notes from storage:', error);
    return [];
  }
}

/**
 * Helper: Save notes to localStorage
 */
function saveNotesToStorage(notes: Note[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('[Mock] Failed to save notes to storage:', error);
  }
}

/**
 * Helper: Extract title from HTML content
 */
function extractTitle(html: string): string {
  // Remove HTML tags and get first line
  const text = html.replace(/<[^>]*>/g, '').trim();
  const firstLine = text.split('\n')[0] || text.split(' ')[0] || '';
  return firstLine.slice(0, 50) || 'Untitled'; // Limit title length
}
