import type { LucideIcon } from 'lucide-react'
import { AlarmClock, ChevronRight, Gem, PencilLine, Search, Sprout, TriangleAlert, Upload, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Initials, Money, PageHeader, Panel, TabIntro, Tag } from '@/components/common'
import { TONE } from '@/lib/ui-tokens'
import { useDrawer } from '@/components/drawers/context'
import { isCro, isLate, planFor, planObj } from '@/lib/business'
import { eur } from '@/lib/format'
import { setUi, useAppState, type ClientTab } from '@/lib/store'
import type { Client } from '@/lib/data'

const FILTERS: Record<ClientTab, (c: Client) => boolean> = {
  liste: () => true,
  retard: isLate,
  fideles: (c) => c.visits >= 20,
  nouvelles: (c) => c.visits <= 4,
  incomplet: (c) => !c.phone || !c.email,
}

function ContactTags({ c }: { c: Client }) {
  return (
    <span className="flex flex-wrap gap-1">
      {c.phone ? <Tag className={TONE.grey}>SMS</Tag> : <Tag className={TONE.red}>Tél. manquant</Tag>}
      {c.email ? <Tag className={TONE.grey}>E-mail</Tag> : <Tag className={TONE.red}>E-mail manquant</Tag>}
    </span>
  )
}

const lastVisit = (c: Client) => (c.last === 0 ? 'Cette semaine' : `Il y a ${c.last} sem.`)

export function ClientesPage() {
  const st = useAppState()
  const drawer = useDrawer()
  const cro = isCro(st.settings)
  const { tab, q } = st.ui
  const ql = q.toLowerCase()
  const list = st.clients
    .filter((c) => !ql || c.name.toLowerCase().includes(ql) || (c.fav || '').toLowerCase().includes(ql))
    .filter(FILTERS[tab])
  const cap = planObj(st.settings).max

  const tabs: { k: ClientTab; l: string }[] = [
    { k: 'liste', l: 'Toutes' },
    { k: 'retard', l: 'En retard de visite' },
    { k: 'fideles', l: 'Très fidèles' },
    { k: 'nouvelles', l: 'Nouvelles' },
    { k: 'incomplet', l: 'Coordonnées manquantes' },
  ]
  const intro: Record<ClientTab, [LucideIcon, string, string]> = {
    liste: [Users, 'Votre fichier client', `Toutes les clientes de votre dernier import. Cliquez sur une ligne pour ouvrir la fiche : historique, coordonnées${cro ? ', plan de revenus' : ''} et opportunités.`],
    retard: [AlarmClock, 'Clientes en retard de visite', 'Leur dernière visite dépasse leur rythme habituel. Ce sont les clientes les plus faciles à récupérer : elles vous connaissent déjà.'],
    fideles: [Gem, 'Clientes très fidèles', 'Plus de 20 visites. Idéales pour le parrainage et les cures longues. À chouchouter, pas à démarcher.'],
    nouvelles: [Sprout, 'Nouvelles clientes', '4 visites ou moins. Les 3 premières visites décident si elles deviendront régulières : soignez le suivi post-soin.'],
    incomplet: [PencilLine, 'Coordonnées manquantes', "Sans téléphone ou e-mail, impossible de relancer. Complétez-les depuis la fiche : 2 minutes qui débloquent du chiffre d'affaires."],
  }
  const [IIcon, ITitle, IText] = intro[tab]

  return (
    <>
      <PageHeader
        icon={Users}
        title="Clientes"
        desc={`L'espace client regroupe toute votre base : coordonnées, historique de visites, prestations favorites, produits achetés${cro ? ' et plan de revenus individuel' : ''}. C'est ici que vous complétez un téléphone ou un e-mail manquant, et que vous écrivez à une cliente précise.${cap !== Infinity ? ` Formule Essentiel : ${st.clients.length} / ${cap} clientes.` : ''}`}
        actions={
          <Button id="importBtn" variant="outline" size="lg" className="bg-card" onClick={drawer.openImport}>
            <Upload aria-hidden="true" />
            Importer ma base (Planity, Kiute…)
          </Button>
        }
      />

      <div id="clientTabs" role="tablist" aria-label="Vues clientes" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
        {tabs.map((t) => (
          <button
            key={t.k}
            type="button"
            role="tab"
            aria-selected={tab === t.k}
            onClick={() => setUi({ tab: t.k })}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-2 transition-colors hover:bg-card hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none',
              tab === t.k && 'bg-card text-ink shadow-sm ring-1 ring-border',
            )}
          >
            {t.l}
            <span className={cn('rounded-full px-1.5 text-xs', tab === t.k ? 'bg-rose text-white' : 'bg-muted text-ink-2')}>
              {st.clients.filter(FILTERS[t.k]).length}
            </span>
          </button>
        ))}
      </div>

      <TabIntro icon={IIcon} title={ITitle}>
        {IText}
      </TabIntro>

      <div className="flex flex-wrap items-center gap-3">
        <label id="clientSearch" className="relative w-full max-w-sm">
          <span className="sr-only">Rechercher une cliente</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-2" aria-hidden="true" />
          <Input value={q} onChange={(e) => setUi({ q: e.target.value })} placeholder="Nom, prestation…" className="h-10 bg-card pl-9" />
        </label>
        <span className="text-sm font-medium text-ink-2">
          {list.length} cliente{list.length > 1 ? 's' : ''}
        </span>
      </div>

      <Panel id="clientTable" bodyClassName="p-0 md:p-0">
        {!list.length && <p className="p-6 text-center text-sm text-ink-2">Aucune cliente ne correspond.</p>}
        {/* Mobile : liste */}
        <ul className="grid divide-y md:hidden">
          {list.map((c) => (
            <li key={c.id}>
              <button type="button" data-client={c.id} onClick={() => drawer.openClient(c.id)} className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 p-4 text-left hover:bg-muted/60">
                <Initials id={c.id} ini={c.ini} />
                <div className="grid min-w-0 gap-1">
                  <b className="font-semibold text-ink">{c.name}</b>
                  <span className="text-xs text-ink-2">
                    {lastVisit(c)} · {c.fav}
                  </span>
                  <ContactTags c={c} />
                </div>
                <div className="flex items-center gap-1">
                  {isLate(c) && <TriangleAlert className="size-4 text-[#9B1C12]" aria-label="En retard de visite" />}
                  {cro && <Money className="text-sm">{eur(planFor(c).total)}</Money>}
                  <ChevronRight className="size-4 text-ink-2" aria-hidden="true" />
                </div>
              </button>
            </li>
          ))}
        </ul>
        {/* Bureau : tableau */}
        {list.length > 0 && (
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Cliente</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Dernière visite</TableHead>
                  <TableHead>Rythme</TableHead>
                  <TableHead className="text-right">Visites</TableHead>
                  <TableHead className="text-right">Dépensé</TableHead>
                  <TableHead>Prestation favorite</TableHead>
                  {cro && <TableHead className="pr-5 text-right">Potentiel</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((c) => (
                  <TableRow
                    key={c.id}
                    data-client={c.id}
                    tabIndex={0}
                    className="cursor-pointer focus-visible:bg-muted focus-visible:outline-none"
                    onClick={() => drawer.openClient(c.id)}
                    onKeyDown={(e) => e.key === 'Enter' && drawer.openClient(c.id)}
                  >
                    <TableCell className="pl-5">
                      <span className="flex items-center gap-2.5 font-medium text-ink">
                        <Initials id={c.id} ini={c.ini} className="size-8" />
                        {c.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <ContactTags c={c} />
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1">
                        {lastVisit(c)}
                        {isLate(c) && <TriangleAlert className="size-3.5 text-[#9B1C12]" aria-label="En retard de visite" />}
                      </span>
                    </TableCell>
                    <TableCell>{c.freq} sem.</TableCell>
                    <TableCell className="text-right">{c.visits}</TableCell>
                    <TableCell className="text-right">{eur(c.spent)}</TableCell>
                    <TableCell>{c.fav}</TableCell>
                    {cro && (
                      <TableCell className="pr-5 text-right">
                        <Money>{eur(planFor(c).total)}</Money>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Panel>
    </>
  )
}
