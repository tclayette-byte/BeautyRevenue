import { useState } from 'react'
import { toast } from 'sonner'
import { Lock, PenLine, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { allowed, findClient, isCro, isLate, normPhone, planFor } from '@/lib/business'
import { eur } from '@/lib/format'
import { mutate, useAppState } from '@/lib/store'
import { Initials, Money, Tag } from '@/components/common'
import { TONE } from '@/lib/ui-tokens'
import { OppRow } from '@/components/opp-row'
import { upgradeToCroissance, useDrawer } from './context'
import { Box, DrawerFrame } from './frame'

export function ClientSheet({ id }: { id: number }) {
  const st = useAppState()
  const drawer = useDrawer()
  const c = findClient(st, id)
  const [phone, setPhone] = useState(c?.phone || '')
  const [email, setEmail] = useState(c?.email || '')
  if (!c) return null

  const cro = isCro(st.settings)
  const co = st.opps.filter((o) => o.c === id)
  const p = planFor(c)
  const basket = c.visits ? c.spent / c.visits : 0
  const tl = [
    { b: c.fav || 'Visite', s: `${c.last === 0 ? 'Cette semaine' : `Il y a ${c.last} semaines`} · ${eur(basket)}` },
    ...(c.services || []).slice(1).map((s, i) => ({ b: s, s: `Il y a ${c.last + c.freq * (i + 1)} semaines` })),
    { b: 'Première visite', s: c.since },
  ]

  const saveContact = (e: React.FormEvent) => {
    e.preventDefault()
    mutate((d) => {
      const C = d.clients.find((x) => x.id === id)
      if (C) {
        C.phone = phone.trim()
        C.email = email.trim()
      }
    })
    toast('Coordonnées enregistrées')
  }

  const newMessage = () => {
    const o = co.find((x) => x.st === 'new' && allowed(st.settings, x.t))
    if (o) {
      drawer.openOpp(o.id)
      return
    }
    const nid = Date.now() % 100000
    mutate((d) => {
      d.opps.push({ id: nid, c: c.id, t: 'reconquete', v: Math.round(basket) || 40, why: 'Message libre depuis la fiche cliente', offer: '-10 % sur votre prochain rendez-vous', st: 'new' })
    })
    drawer.openOpp(nid)
  }

  return (
    <DrawerFrame
      title={c.name}
      sub={`Cliente depuis ${c.since} · ${c.visits} visites`}
      footer={
        <>
          <Button size="lg" onClick={newMessage}>
            <PenLine aria-hidden="true" />
            Écrire un message
          </Button>
          {c.phone && (
            <Button variant="outline" size="lg" asChild>
              <a href={`tel:${normPhone(c.phone)}`}>
                <Phone aria-hidden="true" />
                Appeler
              </a>
            </Button>
          )}
          <Button variant="outline" size="lg" className="ml-auto" onClick={drawer.close}>
            Fermer
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-3">
        <Initials id={c.id} ini={c.ini} className="size-12 text-sm" />
        <div className="grid gap-1">
          <div className="flex flex-wrap gap-1.5">
            {isLate(c) ? <Tag className={TONE.red}>En retard de {c.last - c.freq} sem.</Tag> : <Tag className={TONE.success}>Active</Tag>}
            {c.visits >= 20 && <Tag className={TONE.warn}>Très fidèle</Tag>}
            {c.imported && <Tag className={TONE.lock}>Importée</Tag>}
          </div>
          <span className="text-sm text-ink-2">Prestation favorite : {c.fav || '—'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          [String(c.visits), 'visites'],
          [eur(c.spent), 'dépensés'],
          [eur(basket), 'panier moyen'],
          [`${c.freq} sem.`, 'rythme'],
        ].map(([v, l]) => (
          <div key={l} className="grid rounded-xl bg-muted p-3">
            <b className="font-heading text-xl font-medium text-ink">{v}</b>
            <span className="text-xs text-ink-2">{l}</span>
          </div>
        ))}
      </div>

      <form onSubmit={saveContact}>
        <Box
          title="Coordonnées"
          action={
            <Button type="submit" size="sm">
              Enregistrer
            </Button>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="cfc_phone">Téléphone</Label>
              <Input id="cfc_phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="06 12 34 56 78" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="cfc_email">E-mail</Label>
              <Input id="cfc_email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="prenom.nom@mail.fr" />
            </div>
          </div>
          {(!c.phone || !c.email) && (
            <p className="text-xs font-semibold text-[#9B1C12]">Coordonnée manquante : complétez-la pour pouvoir relancer cette cliente.</p>
          )}
        </Box>
      </form>

      {cro ? (
        <Box title={<>Plan de revenus recommandé <Tag className={TONE.lock}>6 mois</Tag></>}>
          <p className="text-sm text-ink-2">Séquence construite à partir de son historique. Une action à la fois, au bon moment.</p>
          <ol className="grid gap-2">
            {p.steps.map((s, i) => (
              <li key={s.t} className="grid grid-cols-[auto_1fr_auto] items-start gap-3 rounded-lg bg-muted p-3">
                <span className="grid size-6 place-items-center rounded-full bg-plum text-xs font-semibold text-white">{i + 1}</span>
                <div className="grid gap-0.5 text-sm">
                  <b className="font-semibold text-ink">{s.t}</b>
                  <span className="text-ink-2">{s.d}</span>
                  <span className="text-xs font-semibold text-rose-ink">{s.w}</span>
                </div>
                <Money className="text-sm">+{eur(s.v)}</Money>
              </li>
            ))}
          </ol>
          <div className="mt-1 flex items-end justify-between gap-3 rounded-lg bg-night p-3 text-white">
            <div>
              <div className="text-xs text-white/75">Potentiel bonus estimé</div>
              <div className="font-heading text-2xl font-medium">+{eur(p.total)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/75">Valeur actuelle</div>
              <div className="font-heading text-lg font-medium">{eur(c.spent)}</div>
            </div>
          </div>
        </Box>
      ) : (
        <Box className="justify-items-start">
          <Lock className="size-5 text-plum" aria-hidden="true" />
          <b className="font-semibold text-ink">Plan de revenus sur 6 mois</b>
          <p className="text-sm text-ink-2">
            {p.steps.length} actions recommandées pour cette cliente, {eur(p.total)} de potentiel bonus. Disponible en formule Croissance.
          </p>
          <Button size="sm" onClick={upgradeToCroissance}>
            Passer à Croissance
          </Button>
        </Box>
      )}

      {co.length ? (
        <Box title={<>Opportunités liées <Tag className={TONE.grey}>{co.length}</Tag></>}>
          <div className="grid gap-2">
            {co.map((o) => (
              <OppRow key={o.id} o={o} />
            ))}
          </div>
        </Box>
      ) : (
        <Box soft>
          <p className="text-sm text-ink-2">Aucune opportunité ouverte pour cette cliente dans votre dernier import.</p>
        </Box>
      )}

      <Box title="Historique des visites">
        <ul className="grid gap-3 border-l-2 border-blush pl-4">
          {tl.map((x, i) => (
            <li key={i} className="relative grid text-sm">
              <i className="absolute top-1.5 -left-[22px] size-2.5 rounded-full bg-rose" aria-hidden="true" />
              <b className="font-semibold text-ink">{x.b}</b>
              <span className="text-ink-2">{x.s}</span>
            </li>
          ))}
        </ul>
      </Box>

      <Box title="Produits achetés">
        {c.products.length ? (
          <div className="flex flex-wrap gap-1.5">
            {c.products.map((x) => (
              <Tag key={x} className={TONE.grey}>
                {x}
              </Tag>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-2">Aucun produit pour l'instant.</p>
        )}
      </Box>
    </DrawerFrame>
  )
}
