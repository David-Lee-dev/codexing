'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

import { documentApi } from '@/shared/api/document.api';

import type { SearchResult } from '@/core/types';

const DEBOUNCE_DELAY = 300;

export function useSearch() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const response = await documentApi.searchDocuments(searchQuery.trim());
    if (response.success && response.data) {
      setSearchResults(response.data);
    } else {
      setSearchResults([]);
    }
    setIsSearching(false);
  }, []);

  const handleQueryChange = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (!newQuery.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      timeoutRef.current = setTimeout(() => {
        performSearch(newQuery);
      }, DEBOUNCE_DELAY);
    },
    [performSearch],
  );

  const clearSearch = useCallback(() => {
    setQuery('');
    setSearchResults([]);
    setIsSearching(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    query,
    isSearching,
    searchResults,
    isSearchActive: query.trim().length > 0,
    handleQueryChange,
    clearSearch,
  };
}
