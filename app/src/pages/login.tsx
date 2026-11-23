import { useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { toast } from 'sonner'
import { ArrowLeft, CircleAlert, ShieldCheck, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spotlight } from '@/components/ui/spotlight-new'
import { Initials, Logo } from '@/components/common'
import { DEMO } from '@/lib/data'
import { SITE_URL, go } from '@/lib/router'
import { saveSession } from '@/lib/store'

export function LoginPage() {
  const reduce = useReducedMotion()
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(true)
  const [err, setErr] = useState(false)
  const pwRef = useRef<HTMLInputElement>(null)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (id.trim().toLowerCase() === DEMO.id && pw === DEMO.pw) {
      saveSession(DEMO.id, remember)
      setErr(false)
      go('#/app')
    } else {
      setErr(true)
      setPw('')
      pwRef.current?.focus()
    }
  }

  return (
    <div className="grid min-h-svh bg-background lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-night p-10 text-white lg:flex lg:flex-col lg:justify-between">
        {!reduce && (
          <Spotlight
            gradientFirst="radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(340, 60%, 82%, .14) 0, hsla(340, 55%, 60%, .05) 50%, hsla(340, 50%, 45%, 0) 80%)"
            gradientSecond="radial-gradient(50% 50% at 50% 50%, hsla(36, 45%, 80%, .10) 0, hsla(36, 45%, 60%, .03) 80%, transparent 100%)"
            gradientThird="radial-gradient(50% 50% at 50% 50%, hsla(340, 60%, 82%, .07) 0, hsla(340, 50%, 50%, .02) 80%, transparent 100%)"
            duration={9}
          />
        )}
        <a href={SITE_URL} className="relative z-10 w-fit" aria-label="BeautyRevenue, retour au site">
          <Logo light />
        </a>
        <div className="relative z-10 grid max-w-md gap-6">
          <h2 className="text-4xl leading-tight xl:text-5xl">
            Vos <em className="text-blush">5 minutes</em> du mois vous attendent.
          </h2>
          <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-white/70">Votre mois</div>
                <div className="font-heading text-4xl font-medium">
                  18 <small className="font-sans text-sm text-white/75">opportunités</small>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-blush px-2.5 py-1 text-xs font-semibold text-night">
                <Timer className="size-3.5" aria-hidden="true" /> 5 min
              </span>
            </div>
            <ul className="grid gap-2">
              {[
                { i: 1, ini: 'EM', n: 'Emma M.', w: 'À reconquérir', v: '+65 €' },
                { i: 2, ini: 'SL', n: 'Sophie L.', w: 'Cure à proposer', v: '+290 €' },
              ].map((x) => (
                <li key={x.n} className="flex items-center gap-3 rounded-xl bg-white p-2.5 text-ink">
                  <Initials id={x.i} ini={x.ini} />
                  <div className="flex-1 text-sm">
                    <div className="font-semibold">{x.n}</div>
                    <div className="text-ink-2">{x.w}</div>
                  </div>
                  <span className="text-sm font-semibold text-success">{x.v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="relative z-10 inline-flex items-center gap-2 text-sm text-white/70">
          <ShieldCheck className="size-4" aria-hidden="true" /> Données hébergées en France · Conforme RGPD
        </p>
      </aside>

      <main className="flex flex-col px-4 py-6 sm:px-8">
        <a href={SITE_URL} className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden="true" /> Retour au site
        </a>
        <div className="grid flex-1 place-items-center py-8">
          <form onSubmit={submit} noValidate className="grid w-full max-w-sm gap-5">
            <Logo className="lg:hidden" />
            <div>
              <h1 className="text-4xl text-ink">Connexion</h1>
              <p className="mt-1 text-[0.95rem] text-ink-2">Accédez à votre espace institut.</p>
            </div>
            {err && (
              <div role="alert" className="flex items-center gap-2 rounded-lg bg-[#FBE1DE] px-3 py-2.5 text-sm font-medium text-[#9B1C12]">
                <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
                Identifiant ou mot de passe incorrect.
              </div>
            )}
            <div className="grid gap-1.5">
              <Label htmlFor="loginId">Identifiant</Label>
              <Input
                id="loginId"
                type="email"
                autoComplete="username"
                placeholder="vous@votre-institut.fr"
                required
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="h-11 bg-card"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="loginPw">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="loginPw"
                  ref={pwRef}
                  type={show ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  className="h-11 bg-card pr-24"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute inset-y-1 right-1 rounded-md px-3 text-sm font-medium text-rose-ink hover:bg-muted"
                >
                  {show ? 'Masquer' : 'Afficher'}
                </button>
              </div>
            </div>
            <label className="flex items-center gap-2.5 text-sm font-medium text-ink">
              <Checkbox checked={remember} onCheckedChange={(v) => setRemember(v === true)} className="size-[18px] bg-card" />
              Rester connectée
            </label>
            <Button type="submit" size="lg" className="h-11 w-full text-[0.95rem]">
              Se connecter
            </Button>
            <div className="grid gap-1 rounded-xl border border-blush/70 bg-[#FBF1F4] p-4 text-sm text-ink">
              <b className="font-semibold">Compte de démonstration</b>
              <span>
                Identifiant : <code className="rounded bg-card px-1">{DEMO.id}</code>
              </span>
              <span>
                Mot de passe : <code className="rounded bg-card px-1">{DEMO.pw}</code>
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-1.5 justify-self-start bg-card"
                onClick={() => {
                  setId(DEMO.id)
                  setPw(DEMO.pw)
                  setErr(false)
                }}
              >
                Remplir automatiquement
              </Button>
            </div>
            <div className="flex flex-wrap justify-between gap-2 text-sm">
              <button type="button" className="font-medium text-rose-ink hover:underline" onClick={() => toast('La réinitialisation du mot de passe arrive avec la version connectée. En démo, utilisez le compte ci-dessus.')}>
                Mot de passe oublié ?
              </button>
              <a href={`${SITE_URL}#tarifs`} className="font-medium text-rose-ink hover:underline">
                Pas encore cliente ? -50 % le 1er mois
              </a>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
