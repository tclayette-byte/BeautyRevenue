import { useSyncExternalStore } from 'react'
import type { PageKey } from './tours'

export const PAGES: PageKey[] = ['dashboard', 'opportunites', 'plan', 'clientes', 'envois', 'performance', 'parametres']

export type Route = { view: 'login' } | { view: 'app'; page: PageKey }

const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}
const getHash = () => window.location.hash || ''

export function useHash() {
  return useSyncExternalStore(subscribe, getHash, getHash)
}

export function parseRoute(hash: string): Route {
  if (hash.startsWith('#/app')) {
    const p = hash.replace('#/app', '').replace(/^\//, '').split('/')[0] as PageKey
    return { view: 'app', page: PAGES.includes(p) ? p : 'dashboard' }
  }
  return { view: 'login' }
}

export const go = (hash: string) => {
  window.location.hash = hash
}

/** Adresse du site vitrine (l'outil est servi depuis /outil/) */
export const SITE_URL = '../'
