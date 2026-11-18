import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';
import { useAuth } from './auth.jsx';

/** Keeps the set of bookmarked question ids and a toggle function. */
export function useBookmarks() {
  const { user } = useAuth();
  const [ids, setIds] = useState(new Set());

  useEffect(() => {
    if (!user) {
      setIds(new Set());
      return;
    }
    api.bookmarks()
      .then((list) => setIds(new Set(list.map((q) => q.id))))
      .catch(() => {});
  }, [user]);

  const toggle = useCallback(
    async (id) => {
      const has = ids.has(id);
      try {
        if (has) await api.removeBookmark(id);
        else await api.addBookmark(id);
        setIds((prev) => {
          const next = new Set(prev);
          if (has) next.delete(id);
          else next.add(id);
          return next;
        });
        return !has;
      } catch {
        return has;
      }
    },
    [ids]
  );

  return { ids, toggle };
}

export const formatDate = (iso) => (iso ? new Date(iso).toLocaleString() : '');
