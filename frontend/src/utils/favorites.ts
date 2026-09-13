import { useSyncExternalStore, useCallback, useEffect } from 'react';
import { getMyFavoriteIds, addFavorite, removeFavorite } from '../services/api';

interface StoreState {
  ids: number[];
  loadedForUserId: number | null;
  loading: Promise<void> | null;
  version: number;
}

const store: StoreState = {
  ids: [],
  loadedForUserId: null,
  loading: null,
  version: 0,
};

const listeners = new Set<() => void>();

function emit() {
  store.version++;
  listeners.forEach((l) => l());
}

function authInfo(): { token: string; userId: number } | null {
  try {
    const token = localStorage.getItem('cc_token');
    const raw = localStorage.getItem('cc_user');
    if (!token || !raw) return null;
    const u = JSON.parse(raw) as Record<string, unknown>;
    const id = typeof u.id === 'number' ? u.id : null;
    if (id == null) return null;
    return { token, userId: id };
  } catch {
    return null;
  }
}

function reset() {
  store.ids = [];
  store.loadedForUserId = null;
  store.loading = null;
  emit();
}

export function isFavorite(id: number): boolean {
  return store.ids.includes(id);
}

function doLoad(): Promise<void> {
  if (store.loading) return store.loading;
  store.loading = getMyFavoriteIds()
    .then((ids) => {
      store.ids = ids.slice().sort((a, b) => a - b);
      store.loadedForUserId = authInfo()?.userId ?? null;
    })
    .catch(() => {
      store.ids = [];
      store.loadedForUserId = null;
    })
    .finally(() => {
      store.loading = null;
      emit();
    });
  return store.loading;
}

export function loadFavoritesIfNeeded(): Promise<void> {
  const info = authInfo();
  if (!info) {
    if (store.ids.length || store.loadedForUserId != null) reset();
    return Promise.resolve();
  }
  if (store.loadedForUserId === info.userId) return Promise.resolve();
  return doLoad();
}

export type ToggleResult = 'added' | 'removed' | 'needs-auth' | 'error';

export async function toggleFavorite(id: number): Promise<ToggleResult> {
  const info = authInfo();
  if (!info) return 'needs-auth';
  await loadFavoritesIfNeeded();
  const wasFav = store.ids.includes(id);
  try {
    if (wasFav) {
      await removeFavorite(id);
      store.ids = store.ids.filter((x) => x !== id);
    } else {
      await addFavorite(id);
      store.ids = [...store.ids, id].sort((a, b) => a - b);
    }
    emit();
    return wasFav ? 'removed' : 'added';
  } catch {
    return 'error';
  }
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

function getSnapshot(): number {
  return store.version;
}

export function useFavorites(): { isFav: (id: number) => boolean; toggle: (id: number) => Promise<ToggleResult> } {
  useSyncExternalStore(subscribe, getSnapshot, () => store.version);
  useEffect(() => {
    void loadFavoritesIfNeeded();
  }, []);
  return {
    isFav: useCallback((id: number) => isFavorite(id), []),
    toggle: useCallback((id: number) => toggleFavorite(id), []),
  };
}