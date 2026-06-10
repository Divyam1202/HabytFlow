import { create } from 'zustand'

interface HabitState {
  activeMonth: Date
  setActiveMonth: (date: Date) => void
  nextMonth: () => void
  prevMonth: () => void

  searchQuery: string
  setSearchQuery: (query: string) => void

  categoryFilter: string | null
  setCategoryFilter: (category: string | null) => void
}

export const useHabitStore = create<HabitState>((set) => ({
  activeMonth: new Date(),
  setActiveMonth: (date) => set({ activeMonth: date }),
  nextMonth: () => set((state) => {
    const next = new Date(state.activeMonth)
    next.setMonth(next.getMonth() + 1)
    return { activeMonth: next }
  }),
  prevMonth: () => set((state) => {
    const prev = new Date(state.activeMonth)
    prev.setMonth(prev.getMonth() - 1)
    return { activeMonth: prev }
  }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  categoryFilter: null,
  setCategoryFilter: (category) => set({ categoryFilter: category })
}))
