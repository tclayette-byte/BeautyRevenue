import { Download, Euro, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { PageHeader, Panel } from '@/components/common'
import { BarChart, Legend } from '@/components/charts'
import { AnimatedNumber, Kpi, KpiGrid } from '@/components/kpi'
import { CA, MONTHS } from '@/lib/data'
import { downloadCsv, isCro, planObj, sumV } from '@/lib/business'
import { eur, eur2 } from '@/lib/format'
import { useAppState } from '@/lib/store'

export function PerformancePage() {
  const st = useAppState()
  const cro = isCro(st.settings)
  const plan = planObj(st.settings)
  const done = sumV(st.opps.filter((o) => o.st === 'done'))
  const sent = st.opps.filter((o) => o.st !== 'new').length
  const conv = st.opps.filter((o) => o.st === 'done').length
  const paid = 6 * plan.p
  const tot = CA.reduce((a, b) => a + b, 0)

  const exportCsv = () => {
    downloadCsv('beautyrevenue-performance.csv', `Mois;CA bonus (EUR)\n${MONTHS.map((m, i) => `${m};${CA[i]}`).join('\n')}`)
    toast('Export téléchargé')
  }

  return (
    <>
      <PageHeader
        icon={Euro}
        title="Performance"
        desc="Ce que vos 5 minutes mensuelles vous ont réellement rapporté, comparé à ce que BeautyRevenue vous coûte. Seules les ventes consécutives à un message envoyé depuis cet espace sont comptées : pas d'estimation, pas de « CA influencé »."
        how={[
          ['Attribution stricte', "Une vente est comptée si la cliente revient après un message et dans la fenêtre de l'offre."],
          ['Comparaison abonnement', "Le retour sur investissement est calculé sur l'abonnement réellement payé."],
          ['Export', cro ? 'Téléchargez vos chiffres pour votre comptable.' : 'Disponible en formule Croissance.'],
        ]}
        actions={
          cro ? (
            <Button id="exportBtn" variant="outline" size="lg" className="bg-card" onClick={exportCsv}>
              <Download aria-hidden="true" />
              Exporter (CSV)
            </Button>
          ) : (
            <Button id="exportBtn" variant="outline" size="lg" className="bg-card" disabled>
              <Lock aria-hidden="true" />
              Exporter (CSV)
            </Button>
          )
        }
      />

      <KpiGrid id="perfKpis">
        <Kpi highlight label="CA bonus depuis mai" value={<AnimatedNumber value={tot} suffix=" €" />} trend="6 mois · 30 minutes de votre temps" />
        <Kpi label="Abonnement payé" value={eur2(paid)} sub={`6 × ${eur2(plan.p)}`} />
        <Kpi label="Retour sur investissement" value={<span className="text-rose-ink">{Math.round(tot / paid)}×</span>} />
        <Kpi label="Conversion des envois" value={`${sent ? Math.round((conv / sent) * 100) : 0} %`} sub={`${conv} / ${sent} messages (démo)`} />
      </KpiGrid>

      <div id="perfCharts" className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="CA bonus par mois">
          <BarChart labels={MONTHS} values={CA} />
        </Panel>
        <Panel title="Octobre par levier">
          <Legend
            items={
              cro
                ? [
                    { col: '#B8426D', l: 'Clientes revenues', v: '14 · 910 €' },
                    { col: '#3E2646', l: 'Cures vendues', v: '5 · 1 350 €' },
                    { col: '#C9A877', l: 'Produits', v: '420 €' },
                    { col: '#EBB9C7', l: 'Parrainage', v: '2 filleules · 160 €' },
                    { col: '#8A5A7A', l: 'Ventes complémentaires', v: eur(done) },
                  ]
                : [
                    { col: '#B8426D', l: 'Clientes revenues', v: '14 · 910 €' },
                    { col: '#E7DAE0', l: 'Cures, produits, ventes +, parrainage', v: 'Croissance', muted: true },
                  ]
            }
          />
        </Panel>
      </div>
    </>
  )
}
