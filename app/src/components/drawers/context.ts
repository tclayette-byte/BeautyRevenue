import { createContext, useContext } from 'react'
import { toast } from 'sonner'
import { mutate } from '@/lib/store'

export type DrawerState =
  | { kind: 'opp'; id: number }
  | { kind: 'client'; id: number }
  | { kind: 'import' }
  | { kind: 'upgrade' }
  | null

export interface DrawerApi {
  state: DrawerState
  openOpp: (id: number) => void
  openClient: (id: number) => void
  openImport: () => void
  openUpgrade: () => void
  close: () => void
}

export const DrawerContext = createContext<DrawerApi | null>(null)

export function useDrawer() {
  const ctx = useContext(DrawerContext)
  if (!ctx) throw new Error('useDrawer doit être utilisé dans DrawerProvider')
  return ctx
}

export function upgradeToCroissance() {
  mutate((d) => {
    d.settings.plan = 'croissance'
  })
  toast('Bienvenue en Croissance · 12,49 € le premier mois')
}
