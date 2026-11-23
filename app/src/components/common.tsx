import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Check, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { CHANNEL_LABEL, TYPES, type Opp, type OppType } from '@/lib/data'
import { TONE, type DiffItem } from '@/lib/ui-tokens'

/* ---------- Logo ---------- */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn('grid size-8 place-items-center rounded-[10px] bg-rose text-white', className)} aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 17l5-6 4 4 7-9" />
        <path d="M15 6h5v5" />
      </svg>
    </span>
  )
}

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 font-heading text-xl font-medium', light ? 'text-white' : 'text-ink', className)}>
      <LogoMark />
      BeautyRevenue
    </span>
  )
}

/* ---------- Avatar d'initiales ---------- */
const AV_TONES = [
  'bg-[#F7DDE6] text-[#7A2347]',
  'bg-[#E9DFEC] text-[#3E2646]',
  'bg-[#F3E9DA] text-[#6B4F27]',
  'bg-[#EFE3EA] text-[#6A3D5A]',
  'bg-[#FBE9EE] text-[#8C3756]',
]
export function Initials({ id, ini, className }: { id: number; ini: string; className?: string }) {
  return (
    <span className={cn('grid size-9 shrink-0 place-items-center rounded-[10px] text-xs font-semibold', AV_TONES[id % AV_TONES.length], className)} aria-hidden="true">
      {ini}
    </span>
  )
}

/* ---------- Étiquettes ---------- */
export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap', className)}>
      {children}
    </span>
  )
}


export function TypeTag({ t }: { t: OppType }) {
  return <Tag className={TYPES[t].tone}>{TYPES[t].l}</Tag>
}

export function LockTag({ label = 'Croissance' }: { label?: string }) {
  return (
    <Tag className={TONE.lock}>
      <Lock className="size-3" aria-hidden="true" />
      {label || <span className="sr-only">Formule Croissance</span>}
    </Tag>
  )
}

export function StatusTag({ o, locked }: { o: Opp; locked?: boolean }) {
  if (locked) return <LockTag />
  if (o.st === 'new') return <Tag className={TONE.grey}>À traiter</Tag>
  if (o.st === 'sent') return <Tag className={TONE.info}>Envoyée · {CHANNEL_LABEL[o.ch || 'sms']}</Tag>
  return (
    <Tag className={TONE.success}>
      <Check className="size-3" aria-hidden="true" />
      Convertie
    </Tag>
  )
}

export function Money({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('font-semibold text-success tabular-nums', className)}>{children}</span>
}

/* ---------- En-tête de page ---------- */
export function PageHeader({
  icon: Icon,
  title,
  desc,
  how,
  actions,
}: {
  icon: LucideIcon
  title: string
  desc: ReactNode
  how?: [string, string][]
  actions?: ReactNode
}) {
  return (
    <header id="secHead" className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-3 text-3xl text-ink md:text-[2.1rem]">
          <span className="grid size-10 place-items-center rounded-xl bg-accent text-rose">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          {title}
        </h1>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      <p className="max-w-3xl text-[0.95rem] leading-relaxed text-ink-2">{desc}</p>
      {how && (
        <ol className="grid gap-3 lg:grid-cols-3">
          {how.map(([t, d], i) => (
            <li key={t} className="flex gap-3 rounded-xl border bg-card p-3.5">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-plum text-xs font-semibold text-white">{i + 1}</span>
              <div className="grid gap-0.5 text-sm">
                <b className="font-semibold text-ink">{t}</b>
                <span className="text-ink-2">{d}</span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </header>
  )
}

export function TabIntro({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <div id="tabIntro" className="flex gap-3 rounded-xl border border-blush/60 bg-[#FBF1F4] p-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-rose">
        <Icon className="size-[18px]" aria-hidden="true" />
      </span>
      <div className="grid gap-0.5">
        <h4 className="font-semibold text-ink">{title}</h4>
        <p className="text-sm text-ink-2">{children}</p>
      </div>
    </div>
  )
}

/* ---------- Encart de montée en gamme ---------- */

export function Upsell({
  title,
  text,
  diff,
  id,
  onUpgrade,
}: {
  title: string
  text: string
  diff?: DiffItem[]
  id?: string
  onUpgrade: () => void
}) {
  return (
    <section id={id} className="relative grid gap-3 overflow-hidden rounded-2xl bg-plum p-5 text-white md:p-6">
      <span className="grid size-9 place-items-center rounded-lg bg-white/10 text-blush">
        <Lock className="size-[18px]" aria-hidden="true" />
      </span>
      <h3 className="text-xl md:text-2xl">{title}</h3>
      <p className="max-w-2xl text-sm text-white/80">{text}</p>
      {diff && (
        <div className="flex flex-wrap gap-2">
          {diff.map((x) => (
            <span key={x.l} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
              <x.icon className="size-3.5 text-blush" aria-hidden="true" />
              {x.l}
            </span>
          ))}
        </div>
      )}
      <p className="text-sm text-white/80">
        Croissance : <b className="text-white">24,99 €</b> / mois · soit 9 € de plus qu'Essentiel · premier mois 12,49 €
      </p>
      <div>
        <Button size="lg" className="bg-blush text-night hover:bg-blush/90" onClick={onUpgrade}>
          Passer à Croissance
        </Button>
      </div>
    </section>
  )
}

/* ---------- Bloc panneau ---------- */
export function Panel({
  id,
  title,
  sub,
  action,
  children,
  className,
  bodyClassName,
}: {
  id?: string
  title?: ReactNode
  sub?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section id={id} className={cn('min-w-0 overflow-hidden rounded-2xl border bg-card', className)}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 md:px-5">
          <div className="flex flex-wrap items-baseline gap-x-2">
            {title && <h3 className="font-sans text-base font-semibold text-ink">{title}</h3>}
            {sub && <span className="text-xs text-ink-2">{sub}</span>}
          </div>
          {action}
        </div>
      )}
      <div className={cn('p-4 md:p-5', bodyClassName)}>{children}</div>
    </section>
  )
}

export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="grid place-items-center gap-1 rounded-2xl border border-dashed bg-card px-6 py-10 text-center">
      <b className="font-heading text-xl font-medium text-ink">{title}</b>
      <p className="max-w-md text-sm text-ink-2">{children}</p>
    </div>
  )
}
