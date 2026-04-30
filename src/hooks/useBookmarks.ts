import { useState, useCallback } from 'react';

export interface Bookmark {
  wid: string;
  label: string;
  savedAt: number;
}

const KEY = 'MATH_BOOKMARKS';

function load(): Bookmark[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(load);

  const toggle = useCallback((wid: string, label: string) => {
    setBookmarks(prev => {
      const exists = prev.some(b => b.wid === wid);
      const next = exists
        ? prev.filter(b => b.wid !== wid)
        : [{ wid, label, savedAt: Date.now() }, ...prev].slice(0, 30);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isBookmarked = useCallback((wid: string) => {
    return bookmarks.some(b => b.wid === wid);
  }, [bookmarks]);

  return { bookmarks, toggle, isBookmarked };
}
