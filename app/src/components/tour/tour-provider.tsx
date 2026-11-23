import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { prefersReducedMotion } from '@/lib/format'
import { KEYS, getState, ls, mutate } from '@/lib/store'
import { TOURS, type PageKey, type TourStep } from '@/lib/tours'
import { TourContext, type TourApi } from './context'

function visible(el: Element) {
  return el.getClientRects().length > 0
}

function resolve(step: TourStep, mobile: boolean): HTMLElement | null {
  const sel = step.side && mobile ? '#sideOpen' : step.sel
  for (const part of sel.split(',')) {
    const found = Array.from(document.querySelectorAll<HTMLElement>(part.trim())).find(visible)
    if (found) return found
  }
  return null
}

const markDone = (page: PageKey) =>
  mutate((d) => {
    d.tours[page] = true
  })

export function TourProvider({ page, children }: { page: PageKey; children: ReactNode }) {
  const mobile = useIsMobile()
  const [welcome, setWelcome] = useState<PageKey | null>(null)
  const [run, setRun] = useState<{ page: PageKey; steps: TourStep[]; idx: number } | null>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const elRef = useRef<HTMLElement | null>(null)
  const runRef = useRef(run)
  useLayoutEffect(() => {
    runRef.current = run
  }, [run])

  const runTour = useCallback(
    (p: PageKey) => {
      const steps = TOURS[p].filter((s) => resolve(s, mobile))
      if (!steps.length) return
      setRect(null)
      setRun({ page: p, steps, idx: 0 })
    },
    [mobile],
  )

  const end = useCallback((silent: boolean) => {
    const r = runRef.current
    if (r) {
      markDone(r.page)
      if (!silent) toast('Tutoriel terminé · relancez-le avec « Comment ça marche ? »')
    }
    setRun(null)
    setRect(null)
  }, [])

  const start = useCallback(
    (p: PageKey, manual: boolean) => {
      if (runRef.current) end(true)
      if (!manual && !ls.get(KEYS.welcomed)) {
        setWelcome(p)
        return
      }
      runTour(p)
    },
    [end, runTour],
  )

  // Fin silencieuse au changement de page, puis démarrage automatique si la page n'a jamais été visitée
  useEffect(() => {
    if (runRef.current && runRef.current.page !== page) end(true)
    if (getState().tours[page]) return
    const tm = window.setTimeout(() => {
      if (!getState().tours[page] && !runRef.current) start(page, false)
    }, 600)
    return () => window.clearTimeout(tm)
  }, [page, start, end])

  // Positionnement de la mise en avant
  useEffect(() => {
    if (!run) return
    const step = run.steps[run.idx]
    const el = resolve(step, mobile)
    elRef.current = el
    if (!el) {
      setRect(null)
      return
    }
    const reduce = prefersReducedMotion()
    el.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' })
    const tm = window.setTimeout(() => setRect(el.getBoundingClientRect()), reduce ? 30 : 420)
    const update = () => elRef.current && setRect(elRef.current.getBoundingClientRect())
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.clearTimeout(tm)
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [run, mobile])

  const next = useCallback(() => {
    const r = runRef.current
    if (!r) return
    if (r.idx < r.steps.length - 1) setRun({ ...r, idx: r.idx + 1 })
    else end(false)
  }, [end])
  const prev = useCallback(() => {
    const r = runRef.current
    if (r && r.idx > 0) setRun({ ...r, idx: r.idx - 1 })
  }, [])

  useEffect(() => {
    if (!run) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') end(false)
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [run, end, next, prev])

  const api = useMemo<TourApi>(() => ({ start, active: !!run }), [start, run])

  const closeWelcome = (startNow: boolean) => {
    const p = welcome
    ls.set(KEYS.welcomed, true)
    setWelcome(null)
    if (!p) return
    if (startNow) runTour(p)
    else {
      markDone(p)
      toast('Vous pouvez relancer la visite avec « Comment ça marche ? »')
    }
  }

  const step = run?.steps[run.idx]
  const pad = 8
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1024
  const vh = typeof window !== 'undefined' ? window.innerHeight : 768
  let bubbleStyle: React.CSSProperties | undefined
  if (rect && vw >= 640) {
    const bw = Math.min(380, vw - 32)
    const bh = 250
    const left = Math.min(Math.max(16, rect.left), vw - bw - 16)
    const top = rect.bottom + bh + 24 < vh ? rect.bottom + 16 : rect.top - bh - 16 > 0 ? rect.top - bh - 16 : Math.max(16, vh - bh - 16)
    bubbleStyle = { left, top, width: bw }
  }

  return (
    <TourContext.Provider value={api}>
      {children}

      <Dialog open={!!welcome} onOpenChange={(o) => !o && closeWelcome(false)}>
        <DialogContent showCloseButton={false} className="max-w-md gap-4 bg-card p-6">
          <DialogHeader className="items-center text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-accent text-rose">
              <Sparkles className="size-6" aria-hidden="true" />
            </span>
            <DialogTitle className="font-heading text-2xl font-medium text-ink">Bienvenue dans votre espace BeautyRevenue</DialogTitle>
            <DialogDescription className="text-ink-2">
              Prenons 1 minute pour découvrir votre rituel mensuel : un export déposé, des opportunités classées, des messages envoyés. Le tutoriel vous
              guide.
            </DialogDescription>
          </DialogHeader>
          <ul className="grid gap-2 text-sm text-ink">
            {[
              'Chaque page a son propre tutoriel, 5 étapes maximum.',
              'Vous pouvez le rejouer à tout moment avec « Comment ça marche ? » en haut à droite.',
              "Rien n'est envoyé ni modifié pendant le tutoriel.",
            ].map((x, i) => (
              <li key={x} className="flex gap-3 rounded-lg bg-muted p-2.5">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-plum text-xs font-semibold text-white">{i + 1}</span>
                <span>{x}</span>
              </li>
            ))}
          </ul>
          <DialogFooter className="justify-center gap-2 sm:justify-center">
            <Button size="lg" onClick={() => closeWelcome(true)}>
              Démarrer la visite
            </Button>
            <Button size="lg" variant="ghost" onClick={() => closeWelcome(false)}>
              Plus tard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {run && step && (
        <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-labelledby="tourTitle">
          {/* Bloque les clics sur la page pendant la visite */}
          <div className={cn('absolute inset-0', !rect && 'bg-night/60')} />
          {rect && (
            <div
              className="pointer-events-none absolute rounded-xl ring-2 ring-blush transition-all duration-300 ease-out"
              style={{
                left: rect.left - pad,
                top: rect.top - pad,
                width: rect.width + pad * 2,
                height: rect.height + pad * 2,
                boxShadow: '0 0 0 9999px rgb(29 19 34 / 0.6)',
              }}
            />
          )}
          <div
            className={cn(
              'absolute grid gap-3 rounded-2xl bg-card p-4 text-ink shadow-xl',
              !bubbleStyle && 'inset-x-3 bottom-3',
            )}
            style={bubbleStyle}
          >
            <div className="flex items-center justify-between gap-2 text-xs text-ink-2">
              <span>
                Étape {run.idx + 1} sur {run.steps.length}
              </span>
              <button type="button" className="font-medium text-rose-ink underline-offset-2 hover:underline" onClick={() => end(false)}>
                Passer le tutoriel
              </button>
            </div>
            <h4 id="tourTitle" className="font-heading text-xl font-medium">
              {step.t}
            </h4>
            <p className="text-sm text-ink-2">{step.d}</p>
            <div className="flex gap-1" aria-hidden="true">
              {run.steps.map((_, i) => (
                <i key={i} className={cn('h-1 flex-1 rounded-full', i <= run.idx ? 'bg-rose' : 'bg-muted')} />
              ))}
            </div>
            <div className="flex justify-between gap-2">
              <Button variant="outline" size="lg" disabled={run.idx === 0} onClick={prev}>
                Précédent
              </Button>
              <Button size="lg" onClick={next} autoFocus>
                {run.idx === run.steps.length - 1 ? 'Terminer' : 'Suivant'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </TourContext.Provider>
  )
}
