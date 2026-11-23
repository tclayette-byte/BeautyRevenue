import { useState } from 'react'
import { toast } from 'sonner'
import { Check, History, Link2, Lock, Mail, MessageCircle, MessageSquareText, PenLine, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Initials, LockTag, Money, PageHeader, Panel, TabIntro, Tag, TypeTag, Upsell } from '@/components/common'
import { DIFF, TONE } from '@/lib/ui-tokens'
import { upgradeToCroissance, useDrawer } from '@/components/drawers/context'
import { CHANNEL_LABEL, TYPES, TYPE_KEYS, type OppType, type Template } from '@/lib/data'
import { allowed, bookingLink, findClient, findOpp, isCro } from '@/lib/business'
import { eur } from '@/lib/format'
import { mutate, setUi, useAppState, type EnvTab } from '@/lib/store'

function StatusCell({ done }: { done: boolean }) {
  return done ? (
    <Tag className={TONE.success}>
      <Check className="size-3" aria-hidden="true" />
      Convertie
    </Tag>
  ) : (
    <Tag className={TONE.info}>Envoyée</Tag>
  )
}

function History_() {
  const st = useAppState()
  const drawer = useDrawer()
  const rows = st.sendLog
    .slice()
    .reverse()
    .flatMap((l) => {
      const c = findClient(st, l.c)
      const o = findOpp(st, l.o)
      return c && o ? [{ l, c, o }] : []
    })
  const open = (id: number, t: OppType) => (allowed(st.settings, t) ? drawer.openOpp(id) : drawer.openUpgrade())

  return (
    <>
      <TabIntro icon={History} title="Tout ce qui a été envoyé">
        Chaque message parti depuis BeautyRevenue est tracé avec son canal, sa date et son résultat. Marquez une conversion dès que la cliente revient : le
        CA bonus se met à jour.
      </TabIntro>
      <Panel id="envTable" bodyClassName="p-0 md:p-0">
        {!rows.length && <p className="p-6 text-center text-sm text-ink-2">Aucun envoi pour le moment.</p>}
        <ul className="grid divide-y md:hidden">
          {rows.map(({ l, c, o }) => (
            <li key={l.id}>
              <button type="button" data-opp={o.id} onClick={() => open(o.id, o.t)} className="grid w-full grid-cols-[auto_1fr] gap-3 p-4 text-left hover:bg-muted/60">
                <Initials id={c.id} ini={c.ini} />
                <div className="grid min-w-0 gap-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <b className="font-semibold text-ink">{c.name}</b>
                    <Money className="text-sm">{eur(o.v)}</Money>
                  </div>
                  <span className="text-xs text-ink-2">
                    {l.at} · {CHANNEL_LABEL[l.ch]}
                  </span>
                  <span className="text-sm text-ink">{o.offer}</span>
                  <span className="flex flex-wrap gap-1.5">
                    <TypeTag t={o.t} />
                    <StatusCell done={o.st === 'done'} />
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
        {rows.length > 0 && (
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Date</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Levier</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Offre</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="pr-5 text-right">Valeur</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ l, c, o }) => (
                  <TableRow key={l.id} data-opp={o.id} className="cursor-pointer" onClick={() => open(o.id, o.t)}>
                    <TableCell className="pl-5">{l.at}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2.5 font-medium text-ink">
                        <Initials id={c.id} ini={c.ini} className="size-8" />
                        {c.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <TypeTag t={o.t} />
                    </TableCell>
                    <TableCell>{CHANNEL_LABEL[l.ch]}</TableCell>
                    <TableCell className="max-w-[260px] whitespace-normal">{o.offer}</TableCell>
                    <TableCell>
                      <StatusCell done={o.st === 'done'} />
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <Money>{eur(o.v)}</Money>
                    </TableCell>
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

function TemplateForm({ k, initial, readOnly }: { k: OppType; initial: Template; readOnly: boolean }) {
  const [v, setV] = useState(initial)
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (readOnly) return
        mutate((d) => {
          d.tpl[k] = { ...v }
        })
        toast(`Modèle « ${TYPES[k].l} » enregistré`)
      }}
    >
      <Panel
        title={<TypeTag t={k} />}
        action={
          readOnly ? (
            <LockTag label="Fixe en Essentiel" />
          ) : (
            <Button type="submit" size="sm">
              Enregistrer
            </Button>
          )
        }
        bodyClassName="grid gap-3"
      >
        <div className="grid gap-1.5">
          <Label htmlFor={`tpl-${k}-sms`}>
            SMS <span className="font-normal text-ink-2">· {TYPES[k].d}</span>
          </Label>
          <Textarea id={`tpl-${k}-sms`} className="min-h-[90px]" readOnly={readOnly} value={v.sms} onChange={(e) => setV({ ...v, sms: e.target.value })} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`tpl-${k}-subject`}>Objet e-mail</Label>
          <Input id={`tpl-${k}-subject`} readOnly={readOnly} value={v.subject} onChange={(e) => setV({ ...v, subject: e.target.value })} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`tpl-${k}-email`}>E-mail</Label>
          <Textarea id={`tpl-${k}-email`} className="min-h-[160px]" readOnly={readOnly} value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
        </div>
      </Panel>
    </form>
  )
}

function Models() {
  const st = useAppState()
  const cro = isCro(st.settings)
  return (
    <>
      <TabIntro icon={PenLine} title={cro ? 'Vos modèles, votre ton' : 'Modèles de relance'}>
        {cro
          ? 'Un modèle SMS et un modèle e-mail par levier. Les variables {prenom}, {institut}, {offre}, {lien}, {prestation}, {signature} sont remplacées automatiquement. Modifiez-les librement, ils restent à vous.'
          : 'En formule Essentiel, le modèle de reconquête est fixe : il a été rédigé et testé pour faire revenir les clientes. La personnalisation des messages et des offres, ainsi que les modèles des autres leviers, sont en Croissance.'}
      </TabIntro>
      <div id="tplGrid" className="grid gap-4 lg:grid-cols-2">
        {TYPE_KEYS.filter((k) => allowed(st.settings, k)).map((k) => (
          <TemplateForm key={`${k}-${cro}`} k={k} initial={st.tpl[k]} readOnly={!cro} />
        ))}
      </div>
      {!cro && (
        <Upsell
          id="tplUpsell"
          title="Personnalisez vos messages et vos offres"
          text="En Croissance, chaque modèle est modifiable, l'offre s'ajuste cliente par cliente, et vous disposez des modèles cures, produits, ventes complémentaires et parrainage."
          diff={[DIFF.modeles, DIFF.offre, DIFF.wa]}
          onUpgrade={upgradeToCroissance}
        />
      )}
    </>
  )
}

function Channels() {
  const st = useAppState()
  const s = st.settings
  const cro = isCro(s)
  const [booking, setBooking] = useState(s.booking)
  const [utm, setUtm] = useState(s.utm)
  const [sender, setSender] = useState(s.sender)
  const [sig, setSig] = useState(s.signature)
  const preview = st.opps[0] ? bookingLink({ ...st, settings: { ...s, booking, utm } }, st.opps[0]) : booking

  const cards = [
    { icon: MessageSquareText, l: 'SMS', v: 'Application du téléphone', d: "S'ouvre pré-rempli. Sur ordinateur : copiez le texte.", lock: false },
    { icon: MessageCircle, l: 'WhatsApp', v: 'WhatsApp Web / mobile', d: cro ? "S'ouvre pré-rempli." : 'Formule Croissance.', lock: !cro },
    { icon: Mail, l: 'E-mail', v: 'Votre messagerie', d: 'Destinataire, objet et corps pré-remplis.', lock: false },
  ]

  return (
    <>
      <TabIntro icon={Link2} title="Comment partent vos messages">
        BeautyRevenue prépare chaque message et l'ouvre dans votre application SMS{cro ? ', WhatsApp' : ''} ou votre messagerie : vous n'avez plus qu'à appuyer
        sur Envoyer. Le lien de réservation renvoie vers votre page Planity (ou autre).
      </TabIntro>
      <form
        id="chanForm"
        onSubmit={(e) => {
          e.preventDefault()
          mutate((d) => {
            d.settings.booking = booking.trim()
            if (cro) d.settings.utm = utm
            d.settings.sender = sender
            d.settings.signature = sig
          })
          toast('Canaux enregistrés')
        }}
      >
        <Panel
          title="Lien de réservation"
          action={
            <Button type="submit" size="sm">
              Enregistrer
            </Button>
          }
          bodyClassName="grid gap-4"
        >
          <div className="grid gap-1.5">
            <Label htmlFor="c_booking">URL de votre page de réservation</Label>
            <Input id="c_booking" type="url" value={booking} onChange={(e) => setBooking(e.target.value)} placeholder="https://www.planity.com/votre-institut" />
            <span className="text-xs text-ink-2">Planity, Kiute, Treatwell, votre site… tout lien fonctionne.</span>
          </div>
          <div className={cn('flex items-center justify-between gap-4 rounded-xl bg-muted p-3', !cro && 'opacity-80')}>
            <div className="grid gap-0.5 text-sm">
              <Label htmlFor="c_utm" className="font-semibold">
                Lien signé (attribution du CA)
              </Label>
              <span className="text-ink-2">
                {cro ? 'Ajoute une signature au lien pour attribuer la réservation au bon message et au bon levier.' : 'Réservé à la formule Croissance.'}
              </span>
            </div>
            {cro ? <Switch id="c_utm" checked={utm} onCheckedChange={setUtm} /> : <LockTag label="" />}
          </div>
          <div className="flex items-center gap-2 rounded-xl border bg-card p-2.5">
            <Link2 className="size-4 shrink-0 text-rose" aria-hidden="true" />
            <code className="min-w-0 flex-1 truncate text-xs text-ink" title={preview}>
              {preview}
            </code>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid content-start gap-1.5">
              <Label htmlFor="c_sender">Nom d'expéditeur</Label>
              <Input id="c_sender" value={sender} onChange={(e) => setSender(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="c_sig">Signature des e-mails</Label>
              <Textarea id="c_sig" className="min-h-[70px]" value={sig} onChange={(e) => setSig(e.target.value)} />
            </div>
          </div>
        </Panel>
      </form>
      <div className="grid gap-3 md:grid-cols-3">
        {cards.map((x) => (
          <div key={x.l} className={cn('grid gap-1 rounded-2xl border bg-card p-4', x.lock && 'opacity-70')}>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-2">
              <x.icon className="size-3.5 text-rose" aria-hidden="true" />
              {x.l}
              {x.lock && <Lock className="size-3" aria-label="Formule Croissance" />}
            </span>
            <b className="font-semibold text-ink">{x.v}</b>
            <span className="text-xs text-ink-2">{x.d}</span>
          </div>
        ))}
      </div>
    </>
  )
}

export function EnvoisPage() {
  const st = useAppState()
  return (
    <>
      <PageHeader
        icon={Send}
        title="Envois & messages"
        desc="Tout ce qui concerne la communication avec vos clientes : l'historique de ce qui a été envoyé et converti, vos modèles de SMS et d'e-mails, et la configuration de vos canaux et de votre lien de réservation."
      />
      <Tabs value={st.ui.envTab} onValueChange={(v) => setUi({ envTab: v as EnvTab })} className="gap-5">
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <TabsList id="envTabs" className="h-auto bg-muted p-1 group-data-horizontal/tabs:h-auto">
            <TabsTrigger value="historique" data-etab="historique" className="h-9 px-3">
              Historique des envois
              <span className="rounded-full bg-rose px-1.5 text-xs text-white">{st.sendLog.length}</span>
            </TabsTrigger>
            <TabsTrigger value="modeles" data-etab="modeles" className="h-9 px-3">
              Modèles de messages
            </TabsTrigger>
            <TabsTrigger value="canaux" data-etab="canaux" className="h-9 px-3">
              Canaux & lien de réservation
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="historique" className="grid gap-4">
          <History_ />
        </TabsContent>
        <TabsContent value="modeles" className="grid gap-4">
          <Models />
        </TabsContent>
        <TabsContent value="canaux" className="grid gap-4">
          <Channels />
        </TabsContent>
      </Tabs>
    </>
  )
}
