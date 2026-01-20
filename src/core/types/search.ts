export interface SearchResult {
  id: string;
  title: string | null;
  tags: string[] | null;
  status: number;
  matchType: 'title' | 'tag' | 'content' | 'similar';
  matchSnippet: string | null;
  similarityScore: number | null;
}
