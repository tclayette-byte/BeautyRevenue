import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Check, Copy, Info, Link2, Lock, Mail, MessageCircle, MessageSquareText, RotateCcw, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { CHANNEL_LABEL, TYPES, type Channel } from '@/lib/data'
import { bookingLink, copyText, fill, findClient, findOpp, firstName, isCro, normPhone, nowLong, nowShort, openHref } from '@/lib/business'
import { eur } from '@/lib/format'
import { mutate, useAppState } from '@/lib/store'
import { Initials, Money, TypeTag } from '@/components/common'
import { useDrawer } from './context'
import { Box, DrawerFrame, Linkified } from './frame'

const VARS = ['{prenom}', '{offre}', '{lien}', '{institut}', '{prestation}']

export function OppComposer({ id }: { id: number }) {
  const st = useAppState()
  const drawer = useDrawer()
  const o = findOpp(st, id)
  const c = o ? findClient(st, o.c) : undefined
  const cro = isCro(st.settings)

  const initialCh: Channel = (() => {
    let ch: Channel = o?.ch || (c?.phone ? 'sms' : 'email')
    if (ch === 'wa' && !cro) ch = 'sms'
    return ch
  })()
  const [ch, setCh] = useState<Channel>(initialCh)
  const [draft, setDraft] = useState(() => ({
    sms: o ? o.draftSms || fill(st, st.tpl[o.t].sms, o, initialCh) : '',
    email: o ? o.draftEmail || fill(st, st.tpl[o.t].email, o, initialCh) : '',
    subject: o ? o.draftSubject || fill(st, st.tpl[o.t].subject, o, initialCh) : '',
    offer: o?.offer || '',
  }))
  const [toPhone, setToPhone] = useState(c?.phone || '')
  const [toEmail, setToEmail] = useState(c?.email || '')
  const taRef = useRef<HTMLTextAreaElement>(null)

  if (!o || !c) return null
  const t = TYPES[o.t]
  const oo = { ...o, offer: draft.offer }
  const link = bookingLink(st, oo, ch)
  const msg = ch === 'email' ? draft.email : draft.sms
  const setMsg = (v: string) => setDraft((d) => (ch === 'email' ? { ...d, email: v } : { ...d, sms: v }))

  const saveDraft = () =>
    mutate((d) => {
      const O = d.opps.find((x) => x.id === o.id)
      if (!O) return
      O.draftSms = draft.sms
      O.draftEmail = draft.email
      O.draftSubject = draft.subject
      O.offer = draft.offer
    })

  const pickChannel = (v: Channel) => {
    if (v === 'wa' && !cro) {
      drawer.openUpgrade()
      return
    }
    saveDraft()
    setCh(v)
  }

  const onOffer = (nv: string) => {
    setDraft((d) => {
      const old = d.offer
      const rep = (s: string) => (old && s.includes(old) ? s.split(old).join(nv) : s)
      return { ...d, offer: nv, sms: rep(d.sms), email: rep(d.email) }
    })
  }

  const insertVar = (v: string) => {
    const ta = taRef.current
    const val = fill(st, v, oo, ch)
    const s = ta?.selectionStart ?? msg.length
    const e = ta?.selectionEnd ?? msg.length
    const next = msg.slice(0, s) + val + msg.slice(e)
    setMsg(next)
    requestAnimationFrame(() => {
      ta?.focus()
      ta?.setSelectionRange(s + val.length, s + val.length)
    })
  }

  const resetTpl = () =>
    setDraft((d) => ({
      ...d,
      sms: fill(st, st.tpl[o.t].sms, oo, ch),
      email: fill(st, st.tpl[o.t].email, oo, ch),
      subject: fill(st, st.tpl[o.t].subject, oo, ch),
    }))

  const doSend = () => {
    let href = ''
    if (ch === 'email') {
      const to = toEmail.trim()
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
        toast('Adresse e-mail invalide')
        document.getElementById('toEmail')?.focus()
        return
      }
      href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(msg)}`
    } else {
      const np = normPhone(toPhone.trim())
      if (np.replace(/\D/g, '').length < 10) {
        toast('Numéro de téléphone invalide')
        document.getElementById('toPhone')?.focus()
        return
      }
      href =
        ch === 'sms'
          ? `sms:${np}${/iPhone|iPad|Mac/i.test(navigator.userAgent) ? '&' : '?'}body=${encodeURIComponent(msg)}`
          : `https://wa.me/${np.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`
    }
    mutate((d) => {
      const O = d.opps.find((x) => x.id === o.id)
      const C = d.clients.find((x) => x.id === c.id)
      if (!O || !C) return
      if (ch === 'email') C.email = toEmail.trim()
      else C.phone = toPhone.trim()
      O.draftSms = draft.sms
      O.draftEmail = draft.email
      O.draftSubject = draft.subject
      O.offer = draft.offer
      O.ch = ch
      O.st = O.st === 'new' ? 'sent' : O.st
      O.at = nowShort()
      d.sendLog.push({ id: `L${Date.now()}`, c: C.id, o: O.id, ch, at: nowLong(), st: 'sent' })
      d.settings.minutes = Math.min(5, (d.settings.minutes || 0) + 0.25)
    })
    openHref(href, ch === 'wa')
    drawer.close()
    toast(`${CHANNEL_LABEL[ch]} prêt dans votre application · opportunité marquée envoyée`)
  }

  const convert = () => {
    mutate((d) => {
      const O = d.opps.find((x) => x.id === o.id)
      if (O) O.st = 'done'
    })
    drawer.close()
    toast(`+${eur(o.v)} ajoutés au CA bonus`)
  }

  const n = msg.length
  const seg = Math.ceil(n / (n > 160 ? 153 : 160)) || 1
  const sendLabel = ch === 'sms' ? 'Ouvrir dans SMS et envoyer' : ch === 'wa' ? 'Ouvrir dans WhatsApp et envoyer' : 'Ouvrir dans ma messagerie et envoyer'
  const chans: { k: Channel; l: string; icon: typeof Mail }[] = [
    { k: 'sms', l: 'SMS', icon: MessageSquareText },
    { k: 'wa', l: 'WhatsApp', icon: MessageCircle },
    { k: 'email', l: 'E-mail', icon: Mail },
  ]

  const footer =
    o.st === 'done' ? (
      <>
        <Button variant="outline" size="lg" onClick={drawer.close}>
          Fermer
        </Button>
        <Button variant="outline" size="lg" onClick={() => drawer.openClient(c.id)}>
          Fiche cliente
        </Button>
      </>
    ) : (
      <>
        <Button size="lg" onClick={doSend}>
          <Send aria-hidden="true" />
          {sendLabel}
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={async () => toast((await copyText(ch === 'email' ? `${draft.subject}\n\n${msg}` : msg)) ? 'Message copié' : 'Copie impossible')}
        >
          <Copy aria-hidden="true" />
          Copier
        </Button>
        {o.st === 'sent' && (
          <Button size="lg" className="bg-success text-white hover:bg-success/90" onClick={convert}>
            <Check aria-hidden="true" />
            Cliente revenue (+{eur(o.v)})
          </Button>
        )}
        <Button variant="outline" size="lg" className="sm:ml-auto" onClick={() => drawer.openClient(c.id)}>
          Fiche cliente
        </Button>
      </>
    )

  return (
    <DrawerFrame
      title={`${t.l} · ${firstName(c)}`}
      sub={`Opportunité n°${o.id} · ${o.st === 'new' ? 'à traiter' : o.st === 'sent' ? 'envoyée' : 'convertie'}`}
      footer={footer}
    >
      <div className="flex gap-3">
        <Initials id={c.id} ini={c.ini} className="size-12 text-sm" />
        <div className="grid gap-1">
          <h3 className="font-sans text-base font-semibold text-ink">{c.name}</h3>
          <p className="text-sm text-ink-2">{o.why}</p>
          <div className="flex flex-wrap gap-1.5">
            <TypeTag t={o.t} />
            <Money className="rounded-full bg-success-soft px-2 py-0.5 text-xs">+{eur(o.v)} potentiels</Money>
          </div>
        </div>
      </div>

      {o.st !== 'new' && (
        <Box soft>
          <p className="text-sm text-ink">
            {o.st === 'sent'
              ? `Envoyée le ${o.at || ''} par ${o.ch === 'email' ? 'e-mail' : CHANNEL_LABEL[o.ch || 'sms']}. En attente du retour de la cliente.`
              : `Convertie · ${eur(o.v)} ajoutés au CA bonus.`}
          </p>
        </Box>
      )}

      <div className="grid gap-2">
        <span className="text-sm font-semibold text-ink">Canal d'envoi</span>
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1" role="radiogroup" aria-label="Canal d'envoi">
          {chans.map((x) => {
            const locked = x.k === 'wa' && !cro
            return (
              <button
                key={x.k}
                type="button"
                role="radio"
                aria-checked={ch === x.k}
                onClick={() => pickChannel(x.k)}
                className={cn(
                  'inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-ink-2 transition-colors focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none',
                  ch === x.k && 'bg-card text-ink shadow-sm',
                )}
              >
                <x.icon className="size-4" aria-hidden="true" />
                {x.l}
                {locked && <Lock className="size-3" aria-label="Formule Croissance" />}
              </button>
            )
          })}
        </div>
      </div>

      {ch === 'email' ? (
        <div className="grid gap-1.5">
          <Label htmlFor="toEmail">Adresse e-mail de la cliente</Label>
          <Input id="toEmail" type="email" value={toEmail} onChange={(e) => setToEmail(e.target.value)} placeholder="prenom.nom@mail.fr" />
          <span className="text-xs text-ink-2">Modifiable : enregistrée dans la fiche cliente à l'envoi.</span>
        </div>
      ) : (
        <div className="grid gap-1.5">
          <Label htmlFor="toPhone">Numéro de téléphone de la cliente</Label>
          <Input id="toPhone" type="tel" value={toPhone} onChange={(e) => setToPhone(e.target.value)} placeholder="06 12 34 56 78" />
          <span className="text-xs text-ink-2">Modifiable : enregistré dans la fiche cliente à l'envoi.</span>
        </div>
      )}

      <div className="grid gap-1.5 rounded-xl border border-blush/70 bg-[#FBF1F4] p-3">
        <Label htmlFor="offerIn">
          Offre incluse dans le message
          {!cro && (
            <span className="inline-flex items-center gap-1 font-normal text-ink-2">
              · <Lock className="size-3" aria-hidden="true" /> fixe en Essentiel
            </span>
          )}
        </Label>
        <Input id="offerIn" value={draft.offer} readOnly={!cro} onChange={(e) => onOffer(e.target.value)} className="bg-card" />
        <span className="text-xs text-ink-2">
          {cro
            ? 'Remplace {offre} dans le modèle. Modifiez-la pour cette cliente sans toucher au modèle général.'
            : "La personnalisation de l'offre est disponible en formule Croissance."}
        </span>
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-muted p-2.5">
        <Link2 className="size-4 shrink-0 text-rose" aria-hidden="true" />
        <code className="min-w-0 flex-1 truncate text-xs text-ink" title={link}>
          {link}
        </code>
        <Button variant="outline" size="sm" onClick={async () => toast((await copyText(link)) ? 'Lien copié' : 'Copie impossible')}>
          Copier
        </Button>
      </div>

      {ch === 'email' && (
        <div className="grid gap-1.5">
          <Label htmlFor="subjIn">Objet</Label>
          <Input id="subjIn" value={draft.subject} readOnly={!cro} onChange={(e) => setDraft((d) => ({ ...d, subject: e.target.value }))} />
        </div>
      )}

      <div className="grid gap-1.5">
        <Label htmlFor="msgIn">
          {ch === 'email' ? "Corps de l'e-mail" : 'Message'}
          {!cro && (
            <span className="inline-flex items-center gap-1 font-normal text-ink-2">
              · <Lock className="size-3" aria-hidden="true" /> texte fixe en Essentiel
            </span>
          )}
        </Label>
        {cro && (
          <div className="flex flex-wrap gap-1.5">
            {VARS.map((v) => (
              <button key={v} type="button" onClick={() => insertVar(v)} className="rounded-md border bg-card px-2 py-1 font-mono text-xs text-plum hover:border-blush">
                {v}
              </button>
            ))}
            <button type="button" onClick={resetTpl} className="inline-flex items-center gap-1 rounded-md border bg-card px-2 py-1 text-xs text-ink-2 hover:border-blush">
              <RotateCcw className="size-3" aria-hidden="true" /> Modèle
            </button>
          </div>
        )}
        <Textarea
          id="msgIn"
          ref={taRef}
          value={msg}
          readOnly={!cro}
          onChange={(e) => setMsg(e.target.value)}
          className={ch === 'email' ? 'min-h-[200px]' : 'min-h-[130px]'}
        />
        <div className={cn('text-right text-xs', ch === 'sms' && seg > 2 ? 'font-semibold text-[#9B1C12]' : 'text-ink-2')}>
          {ch === 'sms' ? `${n} caractères · ${seg} SMS` : `${n} caractères`}
        </div>
      </div>

      <div className="grid gap-2">
        <span className="text-sm font-semibold text-ink">Aperçu côté cliente</span>
        {ch === 'email' ? (
          <div className="overflow-hidden rounded-xl border bg-card text-sm">
            <div className="grid gap-0.5 border-b bg-muted px-3 py-2 text-xs text-ink-2">
              <span>
                De : <b className="text-ink">{st.settings.sender}</b> &lt;{st.settings.email}&gt;
              </span>
              <span>
                À : <b className="text-ink">{toEmail || '—'}</b>
              </span>
              <span>
                Objet : <b className="text-ink">{draft.subject}</b>
              </span>
            </div>
            <div className="px-3 py-3 whitespace-pre-wrap text-ink">
              <Linkified text={msg} />
            </div>
            <div className="px-3 pb-3">
              <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-lg bg-rose px-4 py-2 text-sm font-semibold text-white">
                Réserver mon créneau
              </a>
            </div>
          </div>
        ) : (
          <div className="grid gap-1.5 rounded-xl bg-muted p-3">
            <span className="text-xs text-ink-2">
              {ch === 'sms' ? 'SMS' : 'WhatsApp'} · {st.settings.sender} → {toPhone || '—'}
            </span>
            <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-card px-3 py-2 text-sm whitespace-pre-wrap text-ink shadow-sm">
              <Linkified text={msg} />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 rounded-xl border bg-card p-3 text-sm text-ink-2">
        <Info className="mt-0.5 size-4 shrink-0 text-rose" aria-hidden="true" />
        <span>
          En cliquant sur Envoyer, BeautyRevenue ouvre{' '}
          {ch === 'sms' ? "l'application SMS de votre téléphone" : ch === 'wa' ? 'WhatsApp' : 'votre messagerie'} avec le message prêt. Vous validez
          l'envoi vous-même : rien ne part sans vous.
        </span>
      </div>
    </DrawerFrame>
  )
}
