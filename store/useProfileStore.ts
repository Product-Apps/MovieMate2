import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type Gender = 'male' | 'female' | 'other'

interface ProfileState {
  age: number | null
  gender: Gender | null
  language: string | null
  darkMode: boolean
  setAge: (age: number | null) => void
  setGender: (gender: Gender | null) => void
  setLanguage: (language: string | null) => void
  toggleDarkMode: () => void
  hydrate: () => Promise<void>
}

const STORAGE_KEY = 'profile'

export const useProfileStore = create<ProfileState>((set, get) => ({
  age: null,
  gender: null,
  language: null,
  darkMode: true,
  
  setAge: (age) => {
    set({ age })
    persist(get)
  },
  setGender: (gender) => {
    set({ gender })
    persist(get)
  },
  
  setLanguage: (language) => {
    set({ language })
    persist(get)
  },
  
  toggleDarkMode: () => {
    set((state) => ({ darkMode: !state.darkMode }))
    persist(get)
  },
  
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const data = JSON.parse(raw)
      set({ 
        age: data.age ?? null, 
        gender: data.gender ?? null, 
        language: data.language ?? null,
        darkMode: data.darkMode ?? true
      })
    } catch (error) {
      console.error('Failed to hydrate profile:', error)
    }
  },
}))

async function persist(get: () => ProfileState): Promise<void> {
  try {
    const { age, gender, language, darkMode } = get()
    console.log("Persisting profile:", { age, gender, language, darkMode })
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ age, gender, language, darkMode }))
  } catch (error) {
    console.error('Failed to persist profile:', error)
  }
}