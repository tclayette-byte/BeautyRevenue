import type { ReactNode } from 'react'
import { SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'

export function DrawerFrame({ title, sub, children, footer }: { title: ReactNode; sub?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <>
      <SheetHeader className="border-b px-5 py-4 pr-12">
        <SheetTitle className="font-heading text-2xl font-medium text-ink">{title}</SheetTitle>
        {sub ? <SheetDescription className="text-ink-2">{sub}</SheetDescription> : <SheetDescription className="sr-only">Détail</SheetDescription>}
      </SheetHeader>
      <div className="grid flex-1 grid-cols-[minmax(0,1fr)] content-start gap-4 overflow-x-hidden overflow-y-auto px-5 py-4">{children}</div>
      {footer && <div className="flex flex-wrap items-center gap-2 border-t bg-card px-5 py-3">{footer}</div>}
    </>
  )
}

export function Box({ title, action, children, soft, className = '' }: { title?: ReactNode; action?: ReactNode; children: ReactNode; soft?: boolean; className?: string }) {
  return (
    <section className={`grid gap-2 rounded-xl p-4 ${soft ? 'bg-muted' : 'border bg-card'} ${className}`}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          {title && <h4 className="flex items-center gap-2 font-semibold text-ink">{title}</h4>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

/** Transforme les URL d'un texte en liens cliquables */
export function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g)
  return (
    <>
      {parts.map((p, i) =>
        /^https?:\/\//.test(p) ? (
          <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="break-all text-rose-ink underline">
            {p}
          </a>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}
