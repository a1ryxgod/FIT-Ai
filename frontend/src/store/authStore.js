import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const STORAGE_KEY = 'fittrack-auth'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,

      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      setUser: (user) => set({ user }),

      login: ({ access, refresh, user }) => {
        set({ accessToken: access, refreshToken: refresh, user: user ?? get().user })
      },

      logout: () => {
        set({ accessToken: null, refreshToken: null, user: null })
        localStorage.removeItem('fittrack-org')
      },

      isAuthenticated: () => !!get().accessToken,

      updateUser: (partial) => set((s) => ({ user: s.user ? { ...s.user, ...partial } : partial })),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
)
