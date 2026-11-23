import { CA_MONTH, CURES, PLANS, TYPES, type Channel, type Client, type Opp, type OppType, type Settings } from './data'
import { eur } from './format'
import type { AppState } from './store'

export const isCro = (s: Settings) => s.plan === 'croissance'
export const planObj = (s: Settings) => PLANS[s.plan] || PLANS.croissance
export const allowed = (s: Settings, t: OppType) => isCro(s) || !!TYPES[t]?.ess
export const roi = (s: Settings) => Math.round(CA_MONTH / planObj(s).p)

export const findClient = (st: AppState, id: number) => st.clients.find((c) => c.id === id)
export const findOpp = (st: AppState, id: number) => st.opps.find((o) => o.id === id)
export const firstName = (c: Client) => c.name.split(' ')[0]
export const isLate = (c: Client) => c.last > c.freq + 1

export const minutesStr = (s: Settings) => {
  const m = Math.floor(s.minutes)
  const sec = Math.round((s.minutes - m) * 60)
  return `${m} min ${sec < 10 ? '0' : ''}${sec}`
}

/** Opportunités à traiter et accessibles avec la formule actuelle */
export const todoOpps = (st: AppState) => st.opps.filter((o) => o.st === 'new' && allowed(st.settings, o.t))
export const lockedOpps = (st: AppState) => st.opps.filter((o) => o.st === 'new' && !allowed(st.settings, o.t))
export const sumV = (list: Opp[]) => list.reduce((s, o) => s + o.v, 0)

export interface PlanStep {
  t: string
  d: string
  w: string
  v: number
}

export function planFor(c: Client) {
  const steps: PlanStep[] = []
  let total = 0
  const basket = c.visits ? c.spent / c.visits : 60
  const late = isLate(c)
  if (late) {
    steps.push({ t: 'Relance de reconquête', d: `Rythme habituel : toutes les ${c.freq} semaines, absente depuis ${c.last}. Message personnalisé + offre de retour + lien de réservation.`, w: 'Ce mois-ci', v: Math.round(basket) })
  } else if (c.last <= 1 && c.products.length === 0 && /visage|soin/i.test(c.fav)) {
    steps.push({ t: 'Routine produits post-soin', d: 'Envoyer la routine conseillée en cabine après sa dernière visite.', w: 'Ce mois-ci', v: 80 })
  }
  if (c.visits >= 4 && !/cure|forfait/i.test(c.fav)) {
    const cu = CURES.find((x) => x.elig.includes(c.id))
    steps.push({
      t: cu ? `Proposer : ${cu.n}` : 'Proposer une cure sur sa prestation favorite',
      d: `${cu ? `${eur(cu.p)} au lieu de ${eur(cu.ref)}, sur créneaux de semaine. ` : ''}Encaissé tout de suite, ${cu ? '6' : '4'} visites garanties.`,
      w: late ? 'À son retour' : 'Prochain rendez-vous',
      v: cu ? cu.p - Math.round(basket) : 180,
    })
  }
  if (c.services.length < 2) {
    steps.push({ t: 'Vente complémentaire', d: `Une prestation cohérente avec ${c.fav} (duo à tarif préférentiel).`, w: 'Dans 1 à 2 visites', v: Math.round(basket * 0.5) })
  }
  if (c.products.length > 0) {
    steps.push({ t: 'Renouvellement produits', d: `Rappel quand ${c.products[0]} arrive en fin d'utilisation (6 à 8 semaines).`, w: 'Dans 6 semaines', v: 40 })
  }
  if (c.visits >= 20) {
    steps.push({ t: 'Programme de parrainage', d: 'Cliente très fidèle : 15 € pour elle, 15 € pour sa filleule. Chaque filleule vaut en moyenne 120 € la première année.', w: 'Ce mois-ci', v: 120 })
  }
  steps.forEach((s) => (total += s.v))
  return { steps: steps.slice(0, 5), total, late }
}

export function bookingLink(st: AppState, o: Opp, ch?: Channel) {
  const c = findClient(st, o.c)
  const s = st.settings
  const u = s.booking || 'https://www.planity.com'
  if (!s.utm || !isCro(s) || !c) return u
  return `${u}${u.includes('?') ? '&' : '?'}utm_source=beautyrevenue&utm_medium=${ch || o.ch || 'sms'}&utm_campaign=${o.t}&br=${c.id}-${o.id}`
}

/** Remplace les variables {prenom}, {institut}, {offre}, {lien}, {prestation}, {signature} */
export function fill(st: AppState, text: string, o: Opp, ch?: Channel) {
  const c = findClient(st, o.c)
  if (!c) return text
  return text
    .replace(/\{prenom\}/g, firstName(c))
    .replace(/\{institut\}/g, st.settings.name)
    .replace(/\{offre\}/g, o.offer || '')
    .replace(/\{lien\}/g, bookingLink(st, o, ch))
    .replace(/\{prestation\}/g, (c.fav || 'prestation').toLowerCase())
    .replace(/\{signature\}/g, st.settings.signature)
}

export const normPhone = (p: string) => {
  let d = (p || '').replace(/[^\d+]/g, '')
  if (d.charAt(0) === '0') d = `+33${d.slice(1)}`
  return d
}

export const nowShort = () => new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
export const nowLong = () =>
  new Date().toLocaleString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

/* ---------- Utilitaires navigateur ---------- */
export function downloadCsv(name: string, csv: string) {
  const a = document.createElement('a')
  a.href = `data:text/csv;charset=utf-8,﻿${encodeURIComponent(csv)}`
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export async function copyText(txt: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(txt)
      return true
    }
  } catch {
    /* repli ci-dessous */
  }
  const t = document.createElement('textarea')
  t.value = txt
  document.body.appendChild(t)
  t.select()
  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }
  t.remove()
  return ok
}

export function openHref(href: string, newTab: boolean) {
  const a = document.createElement('a')
  a.href = href
  if (newTab) {
    a.target = '_blank'
    a.rel = 'noopener'
  }
  document.body.appendChild(a)
  a.click()
  a.remove()
}
