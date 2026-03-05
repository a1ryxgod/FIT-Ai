import { create } from 'zustand'

export const useWorkoutStore = create((set, get) => ({
  activeSession: null,    // current session being tracked
  sessionSets: [],        // sets added in current session

  setActiveSession: (session) => set({ activeSession: session, sessionSets: [] }),

  addSet: (setData) =>
    set((s) => ({ sessionSets: [...s.sessionSets, setData] })),

  clearSession: () => set({ activeSession: null, sessionSets: [] }),

  isSessionActive: () => !!get().activeSession,
}))
