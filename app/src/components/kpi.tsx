import { useEffect, useRef, useState, type ReactNode } from 'react'
import { animate, useReducedMotion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { GlowingEffect } from '@/components/ui/glowing-effect'
import { cn } from '@/lib/utils'
import { fmt } from '@/lib/format'

/** Nombre qui s'anime jusqu'à sa valeur (désactivé si mouvements réduits). */
export function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(0)
  const from = useRef(0)
  useEffect(() => {
    if (reduce) return
    const ctl = animate(from.current, value, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        from.current = v
        setShown(v)
      },
    })
    return () => ctl.stop()
  }, [value, reduce])
  return (
    <span className="tabular-nums" aria-label={`${prefix}${fmt(value)}${suffix}`}>
      {prefix}
      {fmt(reduce ? value : shown)}
      {suffix}
    </span>
  )
}

export function Kpi({
  label,
  value,
  trend,
  sub,
  highlight,
  negative,
}: {
  label: string
  value: ReactNode
  trend?: ReactNode
  sub?: ReactNode
  highlight?: boolean
  negative?: boolean
}) {
  const reduce = useReducedMotion()
  return (
    <div
      className={cn(
        'relative grid min-w-0 content-start gap-1 rounded-2xl border p-4',
        highlight ? 'border-transparent bg-night text-white' : 'bg-card',
      )}
    >
      <GlowingEffect disabled={!!reduce} spread={36} proximity={48} inactiveZone={0.05} borderWidth={2} glow={false} />
      <span className={cn('text-xs font-medium', highlight ? 'text-white/75' : 'text-ink-2')}>{label}</span>
      <span className={cn('font-heading text-[1.75rem] leading-tight font-medium', highlight ? 'text-white' : 'text-ink')}>{value}</span>
      {trend && (
        <span className={cn('inline-flex items-center gap-1 text-xs font-semibold', negative ? 'text-[#9B1C12]' : highlight ? 'text-blush' : 'text-success')}>
          {!negative && <ArrowUpRight className="size-3.5" aria-hidden="true" />}
          {trend}
        </span>
      )}
      {sub && <span className={cn('text-xs', highlight ? 'text-white/70' : 'text-ink-2')}>{sub}</span>}
    </div>
  )
}

export function KpiGrid({ id, children, className }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <div id={id} className={cn('grid grid-cols-2 gap-3 lg:grid-cols-4', className)}>
      {children}
    </div>
  )
}
