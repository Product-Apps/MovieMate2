import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface FavoritesState {
  favorites: number[]
  toggleFavorite: (movieId: number) => void
  isFavorite: (movieId: number) => boolean
  hydrate: () => Promise<void>
}

const STORAGE_KEY = 'favorites'

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  toggleFavorite: (movieId) => {
    const current = get().favorites
    const exists = current.includes(movieId)
    const next = exists ? current.filter((id) => id !== movieId) : [movieId, ...current]
    set({ favorites: next })
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {})
  },
  isFavorite: (movieId) => get().favorites.includes(movieId),
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      if (!raw) return
      set({ favorites: JSON.parse(raw) || [] })
    } catch {}
  },
}))


