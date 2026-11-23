import { useReducedMotion } from 'motion/react'
import { LayoutDashboard, Lock, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DottedGlowBackground } from '@/components/ui/dotted-glow-background'
import { Panel, PageHeader, Upsell } from '@/components/common'
import { DIFF } from '@/lib/ui-tokens'
import { BarChart, Donut, Legend } from '@/components/charts'
import { AnimatedNumber, Kpi, KpiGrid } from '@/components/kpi'
import { OppRow } from '@/components/opp-row'
import { upgradeToCroissance, useDrawer } from '@/components/drawers/context'
import { CA, CA_MONTH, MONTHS, TYPES, TYPE_KEYS } from '@/lib/data'
import { allowed, isCro, lockedOpps, minutesStr, planObj, roi, sumV, todoOpps } from '@/lib/business'
import { eur, eur2 } from '@/lib/format'
import { useAppState } from '@/lib/store'

export function CycleCard() {
  const st = useAppState()
  const drawer = useDrawer()
  const reduce = useReducedMotion()
  const s = st.settings
  const todo = todoOpps(st)
  const stats = [
    { v: minutesStr(s), l: 'passées ce mois sur 5 min', tone: 'text-blush' },
    { v: String(todo.length), l: 'opportunités à traiter', tone: 'text-white' },
    { v: eur(sumV(todo)), l: 'de potentiel en attente', tone: 'text-blush' },
    { v: `${roi(s)}×`, l: "l'abonnement déjà remboursé", tone: 'text-champagne' },
  ]
  return (
    <section id="cycle" className="relative isolate overflow-hidden rounded-2xl bg-plum p-5 text-white md:p-6">
      <DottedGlowBackground
        className="pointer-events-none absolute inset-0 -z-10 mask-[radial-gradient(ellipse_at_top_right,black_10%,transparent_70%)]"
        gap={14}
        radius={1.4}
        color="rgba(235,185,199,0.55)"
        glowColor="rgba(235,185,199,0.9)"
        opacity={0.5}
        speedScale={reduce ? 0 : 0.6}
      />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid max-w-2xl gap-1">
          <h3 className="text-2xl">Votre rituel d'octobre</h3>
          <p className="text-sm text-white/80">
            Base importée le {s.lastImport} ({s.lastImportSrc}). Prochain import conseillé le 1er novembre
            {isCro(s) && s.reminder ? ', un rappel vous sera envoyé' : ''}.
          </p>
        </div>
        <Button size="lg" className="bg-white text-plum hover:bg-white/90" onClick={drawer.openImport}>
          <Upload aria-hidden="true" />
          Déposer un nouvel export
        </Button>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((x) => (
          <div key={x.l} className="grid rounded-xl bg-white/[0.07] p-3">
            <b className={`font-heading text-2xl font-medium ${x.tone}`}>{x.v}</b>
            <span className="text-xs text-white/75">{x.l}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export function DashboardPage() {
  const st = useAppState()
  const s = st.settings
  const cro = isCro(s)
  const todo = todoOpps(st)
  const byT = TYPE_KEYS.filter((k) => st.opps.some((o) => o.t === k) && allowed(s, k)).map((k) => ({
    k,
    v: sumV(st.opps.filter((o) => o.t === k)),
    col: TYPES[k].col,
  }))
  const tot = byT.reduce((a, b) => a + b.v, 0)
  const plan = planObj(s)

  return (
    <>
      <PageHeader
        icon={LayoutDashboard}
        title="Vue d'ensemble"
        desc="Votre tableau de bord mensuel. Il ne mesure qu'une chose : l'argent réellement généré par vos 5 minutes. Chaque euro affiché correspond à une cliente revenue, une cure signée ou un produit vendu après un message envoyé depuis cet espace."
        how={[
          ['Déposez votre export', 'Une fois par mois, 2 minutes. Les opportunités sont calculées à partir de ce fichier.'],
          ['Traitez les opportunités', 'Chaque message est prêt : offre, lien de réservation, canal. 3 minutes.'],
          ['Encaissez et mesurez', "Le CA bonus se met à jour dès qu'une cliente revient ou achète."],
        ]}
        actions={
          <Button asChild size="lg" id="dashCta">
            <a href="#/app/opportunites">Traiter les {todo.length} opportunités</a>
          </Button>
        }
      />

      <CycleCard />

      <KpiGrid id="dashKpis" className="xl:grid-cols-5">
        <Kpi highlight label="CA bonus ce mois" value={<AnimatedNumber value={CA_MONTH} prefix="+" suffix=" €" />} trend="14 % vs septembre" />
        <Kpi label="Clientes revenues" value="14" trend="3" />
        <Kpi label="Cures vendues" value={cro ? '5' : '—'} trend={cro ? '2' : undefined} sub={cro ? undefined : 'Formule Croissance'} />
        <Kpi label="Produits vendus" value={cro ? '420 €' : '—'} trend={cro ? '9 %' : undefined} sub={cro ? undefined : 'Formule Croissance'} />
        <Kpi label="Retour sur abonnement" value={`${roi(s)}×`} sub={`${eur2(plan.p)} / mois`} />
      </KpiGrid>

      <div id="dashCharts" className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="CA bonus attribué à BeautyRevenue" sub="6 derniers mois">
          <BarChart labels={MONTHS} values={CA} />
        </Panel>
        <Panel title="Potentiel par levier" sub="octobre">
          <div className="flex flex-wrap items-center gap-5">
            <Donut parts={byT.map((x) => ({ ...x, l: TYPES[x.k].l }))} total={tot} />
            <Legend
              items={[
                ...byT.map((x) => ({ col: x.col, l: TYPES[x.k].l, v: eur(x.v) })),
                ...(cro ? [] : [{ col: '#E7DAE0', l: 'Cures, produits, ventes +, parrainage', v: 'Croissance', muted: true }]),
              ]}
            />
          </div>
          {!cro && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-ink-2">
              <Lock className="size-3" aria-hidden="true" /> Leviers réservés à la formule Croissance
            </p>
          )}
        </Panel>
      </div>

      <Panel id="dashTodo" title="À traiter ce mois-ci" sub={`${todo.length} opportunités · triées par valeur`}>
        <div className="grid gap-2">
          {todo
            .slice()
            .sort((a, b) => b.v - a.v)
            .slice(0, 5)
            .map((o) => (
              <OppRow key={o.id} o={o} />
            ))}
          {!todo.length && <p className="text-sm text-ink-2">Tout est traité pour ce mois-ci.</p>}
        </div>
      </Panel>

      {!cro && (
        <Upsell
          id="dashUpsell"
          title={`Il reste ${eur(sumV(lockedOpps(st)))} de potentiel verrouillé`}
          text="Cures, produits, ventes complémentaires et parrainage sont détectés dans votre base, mais réservés à la formule Croissance. C'est là que se trouve l'essentiel du bonus."
          diff={[DIFF.cures, DIFF.produits, DIFF.ventes, DIFF.parrainage, DIFF.plan]}
          onUpgrade={upgradeToCroissance}
        />
      )}
    </>
  )
}
