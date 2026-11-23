import { Lock, Sparkles, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EmptyState, Money, PageHeader, TabIntro, Upsell } from '@/components/common'
import { OppRow } from '@/components/opp-row'
import { upgradeToCroissance, useDrawer } from '@/components/drawers/context'
import { TYPES, TYPE_KEYS, type OppType } from '@/lib/data'
import { allowed, isCro, sumV } from '@/lib/business'
import { eur } from '@/lib/format'
import { setUi, useAppState } from '@/lib/store'

export function OpportunitesPage() {
  const st = useAppState()
  const drawer = useDrawer()
  const s = st.settings
  const cro = isCro(s)
  const f = st.ui.filter !== 'all' && !allowed(s, st.ui.filter) ? 'all' : st.ui.filter
  const all = st.opps.filter((o) => o.st === 'new')
  const list = all.filter((o) => allowed(s, o.t) && (f === 'all' || o.t === f)).sort((a, b) => b.v - a.v)
  const locked = all.filter((o) => !allowed(s, o.t))
  const pot = sumV(list)

  const chip = (k: 'all' | OppType, label: string, n: number, lk = false) => (
    <button
      key={k}
      type="button"
      aria-pressed={f === k}
      onClick={() => (lk ? drawer.openUpgrade() : setUi({ filter: k }))}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:border-blush focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none',
        f === k && 'border-plum bg-plum text-white hover:border-plum',
        lk && 'text-ink-2',
      )}
    >
      {lk && <Lock className="size-3.5" aria-hidden="true" />}
      {label} ({n})
    </button>
  )

  return (
    <>
      <PageHeader
        icon={Sparkles}
        title="Opportunités"
        desc="Les opportunités de chiffre d'affaires détectées dans votre dernier export. BeautyRevenue croise fréquence de visite, dernière venue, prestations et achats pour identifier qui contacter, avec quelle offre. Vous gardez la main : chaque message est relu et envoyé par vous, en 3 minutes pour tout le mois."
        how={[
          ['Choisissez un levier', `Reconquête${cro ? ', cure, produits, vente complémentaire, parrainage' : ' (les autres leviers sont en Croissance)'}.`],
          ['Ouvrez une opportunité', "L'offre, le message et le lien de réservation sont pré-remplis."],
          ['Envoyez depuis vos outils', `SMS${cro ? ', WhatsApp' : ''} ou e-mail : l'envoi part de votre téléphone ou de votre messagerie.`],
        ]}
      />

      {f !== 'all' && allowed(s, f) && (
        <TabIntro icon={Target} title={TYPES[f].l}>
          {TYPES[f].d}
        </TabIntro>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div id="oppChips" className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par levier">
          {chip('all', 'Toutes', all.filter((o) => allowed(s, o.t)).length)}
          {TYPE_KEYS.map((k) => chip(k, TYPES[k].l, all.filter((o) => o.t === k).length, !allowed(s, k)))}
        </div>
        <span id="oppPot" className="text-sm font-medium text-ink-2">
          {list.length} opportunité{list.length > 1 ? 's' : ''} · potentiel <Money>{eur(pot)}</Money>
        </span>
      </div>

      <div id="oppList" className="grid gap-2">
        {list.length ? (
          list.map((o) => <OppRow key={o.id} o={o} />)
        ) : (
          <EmptyState title="Tout est traité">Déposez votre prochain export le 1er du mois : de nouvelles opportunités apparaîtront.</EmptyState>
        )}
      </div>

      {locked.length > 0 && (
        <>
          <Upsell
            id="oppUpsell"
            title={`${locked.length} opportunités supplémentaires détectées · ${eur(sumV(locked))} de potentiel`}
            text="Elles concernent les cures, les produits, les ventes complémentaires et le parrainage. Votre base les contient déjà : il ne manque que la formule pour les traiter."
            onUpgrade={upgradeToCroissance}
          />
          <div className="grid gap-2">
            {locked.map((o) => (
              <OppRow key={o.id} o={o} />
            ))}
          </div>
        </>
      )}
    </>
  )
}
