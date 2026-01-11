import { Block } from './block';

export interface Document {
  id: string;
  title: string;
  status?: 'FLEETING' | 'PERMANENT' | 'ARCHIVED';
  tags?: string[];
  created_at: string;
  updated_at: string;
  blocks?: Block[];
}
