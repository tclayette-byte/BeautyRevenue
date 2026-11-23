/** Espace insécable classique (U+00A0) : l'espace fine U+202F n'existe pas dans toutes les polices */
export const fmt = (n: number) => Math.round(n).toLocaleString('fr-FR').replace(/\u202f/g, '\u00a0')
export const eur = (n: number) => `${fmt(n)} €`
export const eur2 = (n: number) =>
  `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\u202f/g, '\u00a0')} €`

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
