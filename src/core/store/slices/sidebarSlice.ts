import type { StateCreator } from 'zustand';

export interface DocumentListItem {
  id: string;
  title: string | null;
  tags: string[] | null;
  status: number;
  updatedAt: string;
}

export interface SidebarSliceState {
  documentList: DocumentListItem[];
  searchQuery: string;
  isSearching: boolean;
}

export interface SidebarSliceActions {
  setDocumentList: (documents: DocumentListItem[]) => void;
  addDocumentToList: (document: DocumentListItem) => void;
  removeDocumentFromList: (documentId: string) => void;
  updateDocumentInList: (
    documentId: string,
    updates: Partial<Pick<DocumentListItem, 'title' | 'tags' | 'updatedAt'>>,
  ) => void;
  setSearchQuery: (query: string) => void;
  setIsSearching: (isSearching: boolean) => void;
}

export type SidebarSlice = SidebarSliceState & SidebarSliceActions;

const initialSidebarState: SidebarSliceState = {
  documentList: [],
  searchQuery: '',
  isSearching: false,
};

export const createSidebarSlice: StateCreator<
  SidebarSlice,
  [],
  [],
  SidebarSlice
> = (set) => ({
  ...initialSidebarState,

  setDocumentList: (documentList) => set({ documentList }),

  addDocumentToList: (document) =>
    set((state) => ({
      documentList: [document, ...state.documentList],
    })),

  removeDocumentFromList: (documentId) =>
    set((state) => ({
      documentList: state.documentList.filter((doc) => doc.id !== documentId),
    })),

  updateDocumentInList: (documentId, updates) =>
    set((state) => ({
      documentList: state.documentList.map((doc) =>
        doc.id === documentId ? { ...doc, ...updates } : doc,
      ),
    })),

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setIsSearching: (isSearching) => set({ isSearching }),
});
