import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { allowed, findClient } from '@/lib/business'
import { eur } from '@/lib/format'
import { useAppState } from '@/lib/store'
import type { Opp } from '@/lib/data'
import { useDrawer } from '@/components/drawers/context'
import { Initials, Money, StatusTag, TypeTag } from '@/components/common'

export function OppRow({ o }: { o: Opp }) {
  const st = useAppState()
  const drawer = useDrawer()
  const c = findClient(st, o.c)
  if (!c) return null
  const locked = !allowed(st.settings, o.t)
  return (
    <button
      type="button"
      data-opp={o.id}
      onClick={() => (locked ? drawer.openUpgrade() : drawer.openOpp(o.id))}
      className={cn(
        'group grid w-full grid-cols-[auto_1fr] items-center gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:border-blush hover:bg-[#FDF8F9] focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none sm:grid-cols-[auto_1fr_auto]',
        locked && 'opacity-70',
      )}
    >
      <Initials id={c.id} ini={c.ini} className="size-10" />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 font-semibold text-ink">
          {c.name} <TypeTag t={o.t} />
        </div>
        <div className="mt-0.5 text-sm text-ink-2">
          {o.why} · <em className="text-ink">{o.offer}</em>
        </div>
      </div>
      <div className="col-span-2 flex items-center gap-2 sm:col-span-1 sm:justify-end">
        <Money className="rounded-full bg-success-soft px-2 py-0.5 text-xs">+{eur(o.v)}</Money>
        <StatusTag o={o} locked={locked} />
        <ChevronRight className="ml-auto size-4 text-ink-2 sm:ml-0" aria-hidden="true" />
      </div>
    </button>
  )
}
