export interface Note {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  title?: string;
  status?: 'FLEETING' | 'PERMANENT' | 'ARCHIVED';
  tags?: string[];
  ai_tags?: string[];
}

export interface CreateNoteDto {
  content: string;
  title?: string;
}

export interface UpdateNoteDto {
  id: string;
  content: string;
  title?: string;
}
