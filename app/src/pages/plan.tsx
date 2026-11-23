import { ChevronRight, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Initials, Money, PageHeader, Panel, Tag, Upsell } from '@/components/common'
import { DIFF, TONE } from '@/lib/ui-tokens'
import { Kpi, KpiGrid } from '@/components/kpi'
import { upgradeToCroissance, useDrawer } from '@/components/drawers/context'
import { isCro, planFor } from '@/lib/business'
import { eur } from '@/lib/format'
import { useAppState } from '@/lib/store'
import type { Client } from '@/lib/data'

function Situation({ c, late }: { c: Client; late: boolean }) {
  if (late) return <Tag className={TONE.red}>En retard de {c.last - c.freq} sem.</Tag>
  if (c.visits >= 20) return <Tag className={TONE.warn}>Très fidèle</Tag>
  return <Tag className={TONE.success}>Active</Tag>
}

export function PlanPage() {
  const st = useAppState()
  const drawer = useDrawer()
  const cro = isCro(st.settings)

  if (!cro) {
    const tot = st.clients.reduce((s, c) => s + planFor(c).total, 0)
    return (
      <>
        <PageHeader
          icon={TrendingUp}
          title="Plan de revenus"
          desc="Pour chaque cliente, un plan d'action séquencé sur 6 mois : quoi lui proposer, dans quel ordre et à quel moment, pour augmenter sa valeur sans la sur-solliciter."
        />
        <Upsell
          id="planUpsell"
          title="Le plan de revenus est réservé à la formule Croissance"
          text={`Il combine les 5 leviers pour chaque cliente : reconquête, cure, routine produits, vente complémentaire, parrainage. Sur votre base actuelle, le potentiel 6 mois estimé est de ${eur(tot)}.`}
          diff={[DIFF.cures, DIFF.produits, DIFF.ventes, DIFF.parrainage]}
          onUpgrade={upgradeToCroissance}
        />
      </>
    )
  }

  const plans = st.clients.map((c) => ({ c, p: planFor(c) })).sort((a, b) => b.p.total - a.p.total)
  const tot = plans.reduce((s, x) => s + x.p.total, 0)
  const n = st.clients.length

  return (
    <>
      <PageHeader
        icon={TrendingUp}
        title="Plan de revenus"
        desc="Pour chaque cliente, BeautyRevenue construit un plan d'action séquencé : quoi lui proposer, dans quel ordre et à quel moment, pour augmenter sa valeur sur les 6 prochains mois sans la sur-solliciter. Le plan est recalculé à chaque import mensuel."
        how={[
          ['Priorisez', 'Les clientes sont classées par potentiel de CA bonus.'],
          ['Suivez la séquence', 'Une action à la fois, au bon moment, pour une relation naturelle.'],
          ['Ajustez', 'Chaque étape peut être lancée, décalée ou retirée depuis la fiche cliente.'],
        ]}
      />

      <KpiGrid id="planKpis">
        <Kpi highlight label="Potentiel 6 mois sur le fichier" value={eur(tot)} trend={`${n} clientes analysées`} />
        <Kpi label="Potentiel moyen par cliente" value={eur(n ? tot / n : 0)} />
        <Kpi label="Clientes en retard de visite" value={String(plans.filter((x) => x.p.late).length)} trend="à relancer en priorité" negative />
        <Kpi label="Actions planifiées" value={String(plans.reduce((s, x) => s + x.p.steps.length, 0))} />
      </KpiGrid>

      <Panel id="planTable" title="Plans par cliente" sub="classés par potentiel" bodyClassName="p-0 md:p-0">
        {/* Mobile : liste */}
        <ul className="grid divide-y md:hidden">
          {plans.map(({ c, p }, i) => {
            const nx = p.steps[0]
            return (
              <li key={c.id}>
                <button
                  type="button"
                  data-client={c.id}
                  {...(i === 0 ? { 'data-plan-first': '' } : {})}
                  onClick={() => drawer.openClient(c.id)}
                  className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 p-4 text-left hover:bg-muted/60"
                >
                  <Initials id={c.id} ini={c.ini} />
                  <div className="grid min-w-0 gap-1">
                    <b className="font-semibold text-ink">{c.name}</b>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-ink-2">
                      <Situation c={c} late={p.late} />
                      {nx && <span>{nx.t} · <span className="font-semibold text-rose-ink">{nx.w}</span></span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Money className="text-sm">{eur(p.total)}</Money>
                    <ChevronRight className="size-4 text-ink-2" aria-hidden="true" />
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
        {/* Bureau : tableau */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Cliente</TableHead>
                <TableHead>Situation</TableHead>
                <TableHead>Prochaine action</TableHead>
                <TableHead>Étapes</TableHead>
                <TableHead className="text-right">Potentiel 6 mois</TableHead>
                <TableHead className="pr-5" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map(({ c, p }, i) => {
                const nx = p.steps[0]
                return (
                  <TableRow key={c.id} data-client={c.id} className="cursor-pointer" onClick={() => drawer.openClient(c.id)}>
                    <TableCell className="pl-5">
                      <span className="flex items-center gap-2.5 font-medium text-ink">
                        <Initials id={c.id} ini={c.ini} className="size-8" />
                        {c.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Situation c={c} late={p.late} />
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      {nx ? (
                        <>
                          {nx.t} <span className="text-xs font-semibold text-rose-ink">· {nx.w}</span>
                        </>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>{p.steps.length}</TableCell>
                    <TableCell className="text-right">
                      <Money>{eur(p.total)}</Money>
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        {...(i === 0 ? { 'data-plan-first': '' } : {})}
                        onClick={(e) => {
                          e.stopPropagation()
                          drawer.openClient(c.id)
                        }}
                      >
                        Voir le plan
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </Panel>
    </>
  )
}
