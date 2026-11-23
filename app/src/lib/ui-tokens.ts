import type { LucideIcon } from 'lucide-react'
import { CalendarCheck, Gift, MessageCircle, Package, PenLine, ShoppingBag, TrendingUp, Users } from 'lucide-react'

/** Teintes des étiquettes (fond clair + texte foncé, contraste AA) */
export const TONE = {
  grey: 'bg-muted text-ink-2',
  red: 'bg-[#FBE1DE] text-[#9B1C12]',
  success: 'bg-success-soft text-success',
  info: 'bg-[#E3EAF3] text-[#26436B]',
  lock: 'bg-[#E9DFEC] text-plum',
  warn: 'bg-warn-soft text-warn',
} as const

export type DiffItem = { icon: LucideIcon; l: string }
export const DIFF = {
  cures: { icon: CalendarCheck, l: 'Cures' },
  produits: { icon: Package, l: 'Produits' },
  ventes: { icon: ShoppingBag, l: 'Ventes +' },
  parrainage: { icon: Users, l: 'Parrainage' },
  plan: { icon: TrendingUp, l: 'Plan de revenus' },
  wa: { icon: MessageCircle, l: 'WhatsApp' },
  modeles: { icon: PenLine, l: 'Modèles modifiables' },
  offre: { icon: Gift, l: 'Offre par cliente' },
} satisfies Record<string, DiffItem>
