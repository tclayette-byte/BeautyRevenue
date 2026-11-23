import { createContext, useContext } from 'react'
import type { PageKey } from '@/lib/tours'

export interface TourApi {
  start: (page: PageKey, manual: boolean) => void
  active: boolean
}

export const TourContext = createContext<TourApi | null>(null)

export function useTour() {
  const ctx = useContext(TourContext)
  if (!ctx) throw new Error('useTour doit être utilisé dans TourProvider')
  return ctx
}
