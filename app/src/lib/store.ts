import { useSyncExternalStore } from 'react'
import {
  DEF_CLIENTS,
  DEF_LOG,
  DEF_OPPS,
  DEF_SETTINGS,
  TPL_DEF,
  clone,
  type Client,
  type LogEntry,
  type Opp,
  type OppType,
  type Settings,
  type Templates,
  type Tours,
} from './data'

/* ---------- Accès localStorage (mêmes clés que l'ancienne version) ---------- */
export const ls = {
  get<T>(k: string): T | null {
    try {
      const raw = localStorage.getItem(k)
      return raw == null ? null : (JSON.parse(raw) as T)
    } catch {
      return null
    }
  },
  set(k: string, v: unknown) {
    try {
      localStorage.setItem(k, JSON.stringify(v))
    } catch {
      /* stockage indisponible */
    }
  },
  del(k: string) {
    try {
      localStorage.removeItem(k)
    } catch {
      /* stockage indisponible */
    }
  },
}

export const KEYS = {
  session: 'br7_session',
  clients: 'br7_clients',
  opps: 'br7_opps',
  tpl: 'br7_tpl',
  settings: 'br7_settings',
  log: 'br7_log',
  tours: 'br7_tours',
  welcomed: 'br7_welcomed',
  src: 'br7_src',
} as const

/** Clés effacées par « Réinitialiser les données de démo » (identique à l'ancienne version) */
const RESET_KEYS = ['br7_clients', 'br7_opps', 'br7_tpl', 'br7_settings', 'br7_log', 'br7_tours', 'br7_pres_seen', 'br7_welcomed', 'br7_src', 'br7_leads']

export type ClientTab = 'liste' | 'retard' | 'fideles' | 'nouvelles' | 'incomplet'
export type EnvTab = 'historique' | 'modeles' | 'canaux'

export interface UiState {
  tab: ClientTab
  filter: 'all' | OppType
  q: string
  envTab: EnvTab
}

export interface AppState {
  clients: Client[]
  opps: Opp[]
  tpl: Templates
  settings: Settings
  sendLog: LogEntry[]
  tours: Tours
  ui: UiState
}

function load(): AppState {
  return {
    clients: ls.get<Client[]>(KEYS.clients) || clone(DEF_CLIENTS),
    opps: ls.get<Opp[]>(KEYS.opps) || clone(DEF_OPPS),
    tpl: ls.get<Templates>(KEYS.tpl) || clone(TPL_DEF),
    settings: ls.get<Settings>(KEYS.settings) || clone(DEF_SETTINGS),
    sendLog: ls.get<LogEntry[]>(KEYS.log) || clone(DEF_LOG),
    tours: ls.get<Tours>(KEYS.tours) || {},
    ui: { tab: 'liste', filter: 'all', q: '', envTab: 'historique' },
  }
}

let state: AppState = load()
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

function persist(s: AppState) {
  ls.set(KEYS.clients, s.clients)
  ls.set(KEYS.opps, s.opps)
  ls.set(KEYS.tpl, s.tpl)
  ls.set(KEYS.settings, s.settings)
  ls.set(KEYS.log, s.sendLog)
  ls.set(KEYS.tours, s.tours)
}

export const getState = () => state

/** Modifie une copie de l'état, enregistre dans localStorage et notifie l'interface. */
export function mutate(fn: (draft: AppState) => void) {
  const draft = structuredClone(state)
  fn(draft)
  state = draft
  persist(state)
  emit()
}

/** État d'interface (onglets, filtres) : non enregistré. */
export function setUi(patch: Partial<UiState>) {
  state = { ...state, ui: { ...state.ui, ...patch } }
  emit()
}

export function resetDemo() {
  RESET_KEYS.forEach(ls.del)
  state = load()
  emit()
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getState, getState)
}

/* ---------- Session ---------- */
export function isAuth() {
  let ss: string | null = null
  try {
    ss = sessionStorage.getItem(KEYS.session)
  } catch {
    ss = null
  }
  return !!(ls.get(KEYS.session) || ss)
}

export function saveSession(user: string, remember: boolean) {
  const s = { user, at: Date.now() }
  if (remember) ls.set(KEYS.session, s)
  else {
    try {
      sessionStorage.setItem(KEYS.session, JSON.stringify(s))
    } catch {
      /* stockage indisponible */
    }
  }
}

export function clearSession() {
  ls.del(KEYS.session)
  try {
    sessionStorage.removeItem(KEYS.session)
  } catch {
    /* stockage indisponible */
  }
}
