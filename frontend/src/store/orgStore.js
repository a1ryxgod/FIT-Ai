import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useOrgStore = create(
  persist(
    (set, get) => ({
      currentOrg: null,    // { id, name, slug, role }
      organizations: [],   // list of user orgs

      setCurrentOrg: (org) => set({ currentOrg: org }),

      setOrganizations: (orgs) => set({ organizations: orgs }),

      addOrganization: (org) =>
        set((s) => ({ organizations: [...s.organizations.filter((o) => o.id !== org.id), org] })),

      clearOrg: () => set({ currentOrg: null, organizations: [] }),

      getRole: () => get().currentOrg?.role ?? null,

      isOwner: () => get().currentOrg?.role === 'owner',
      isAdmin: () => ['owner', 'admin'].includes(get().currentOrg?.role),
      isTrainer: () => ['owner', 'admin', 'trainer'].includes(get().currentOrg?.role),
    }),
    {
      name: 'fittrack-org',
      partialise: (state) => ({
        currentOrg: state.currentOrg,
        organizations: state.organizations,
      }),
    }
  )
)
