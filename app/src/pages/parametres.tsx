import { useState } from 'react'
import { toast } from 'sonner'
import { Mail, Settings as SettingsIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { LockTag, PageHeader, Panel } from '@/components/common'
import { useDrawer } from '@/components/drawers/context'
import { useTour } from '@/components/tour/context'
import { PLANS, type PlanKey, type Settings } from '@/lib/data'
import { copyText, isCro, planObj } from '@/lib/business'
import { eur2 } from '@/lib/format'
import { mutate, resetDemo, useAppState } from '@/lib/store'

type Field = 'name' | 'owner' | 'email' | 'phone' | 'city'

function LockedRow({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-muted p-3 opacity-80">
      <div className="grid gap-0.5 text-sm">
        <b className="font-semibold text-ink">{title}</b>
        <span className="text-ink-2">Réservé à la formule Croissance.</span>
      </div>
      <LockTag label="" />
    </div>
  )
}

export function ParametresPage() {
  const st = useAppState()
  const drawer = useDrawer()
  const tour = useTour()
  const s = st.settings
  const cro = isCro(s)
  const [form, setForm] = useState<Pick<Settings, Field>>({ name: s.name, owner: s.owner, email: s.email, phone: s.phone, city: s.city })
  const code = `import-${s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}@beautyrevenue.fr`

  const field = (k: Field, label: string, type = 'text') => (
    <div className="grid gap-1.5">
      <Label htmlFor={`s_${k}`}>{label}</Label>
      <Input id={`s_${k}`} type={type} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
    </div>
  )

  const setPlan = (k: PlanKey) => {
    mutate((d) => {
      d.settings.plan = k
    })
    toast(`Formule ${PLANS[k].n} activée`)
  }

  return (
    <>
      <PageHeader
        icon={SettingsIcon}
        title="Paramètres"
        desc="Les informations de votre institut, votre formule, l'import de votre base clients et vos rappels. Le lien de réservation et les modèles de messages se règlent dans « Envois & messages »."
      />

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <div className="grid gap-4">
          <form
            id="settingsForm"
            onSubmit={(e) => {
              e.preventDefault()
              mutate((d) => {
                Object.assign(d.settings, form)
              })
              toast('Paramètres enregistrés')
            }}
          >
            <Panel
              title="Mon institut"
              action={
                <Button type="submit" size="sm">
                  Enregistrer
                </Button>
              }
              bodyClassName="grid gap-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {field('name', "Nom de l'institut")}
                {field('owner', 'Responsable')}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {field('email', 'E-mail de connexion', 'email')}
                {field('phone', 'Téléphone')}
              </div>
              {field('city', 'Ville')}
            </Panel>
          </form>

          <Panel
            id="setImport"
            title="Base de données client"
            action={
              <Button size="sm" onClick={drawer.openImport}>
                Importer
              </Button>
            }
            bodyClassName="grid gap-3"
          >
            <div className="grid gap-0.5 rounded-xl bg-muted p-3 text-sm">
              <b className="font-semibold text-ink">Dernier import : {s.lastImport}</b>
              <span className="text-ink-2">{s.lastImportSrc} · prochain import conseillé le 1er novembre</span>
            </div>
            {cro ? (
              <div className="flex items-center justify-between gap-4 rounded-xl bg-muted p-3">
                <div className="grid gap-0.5 text-sm">
                  <Label htmlFor="s_reminder" className="font-semibold">
                    Rappel mensuel
                  </Label>
                  <span className="text-ink-2">Un e-mail le 1er de chaque mois pour vous rappeler de déposer votre export.</span>
                </div>
                <Switch
                  id="s_reminder"
                  checked={s.reminder}
                  onCheckedChange={(v) => {
                    mutate((d) => {
                      d.settings.reminder = v
                    })
                    toast(v ? 'Rappel mensuel activé' : 'Rappel mensuel désactivé')
                  }}
                />
              </div>
            ) : (
              <LockedRow title="Rappel mensuel" />
            )}
            {cro ? (
              <div className="grid gap-1.5">
                <span className="text-sm font-medium text-ink">Import par e-mail</span>
                <div className="flex items-center gap-2 rounded-xl border bg-card p-2.5">
                  <Mail className="size-4 shrink-0 text-rose" aria-hidden="true" />
                  <code className="min-w-0 flex-1 truncate text-xs text-ink">{code}</code>
                  <Button variant="outline" size="sm" onClick={async () => toast((await copyText(code)) ? 'Adresse copiée' : 'Copie impossible')}>
                    Copier
                  </Button>
                </div>
                <span className="text-xs text-ink-2">
                  Transférez l'export de votre logiciel à cette adresse depuis votre téléphone : il est importé automatiquement, sans ouvrir BeautyRevenue.
                </span>
              </div>
            ) : (
              <LockedRow title="Import par e-mail" />
            )}
          </Panel>
        </div>

        <div className="grid gap-4">
          <Panel id="setPlan" title="Formule" sub="-50 % le premier mois" bodyClassName="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Formule">
              {(Object.keys(PLANS) as PlanKey[]).map((k) => {
                const p = PLANS[k]
                const active = s.plan === k
                return (
                  <label
                    key={k}
                    className={cn(
                      'grid cursor-pointer gap-1 rounded-xl border bg-card p-4 transition-colors hover:border-blush has-focus-visible:ring-3 has-focus-visible:ring-ring/40',
                      active && 'border-rose ring-1 ring-rose',
                    )}
                  >
                    <input type="radio" name="plan" value={k} checked={active} onChange={() => setPlan(k)} className="sr-only" />
                    <b className="font-semibold text-ink">{p.n}</b>
                    <span className="font-heading text-2xl font-medium text-ink">
                      {eur2(p.p)} <small className="font-sans text-xs text-ink-2">/ mois</small>
                    </span>
                    <span className="text-xs text-ink-2">
                      {k === 'essentiel' ? 'Reconquête · SMS, e-mail · 300 clientes' : '5 leviers · plan de revenus · WhatsApp · illimité'}
                    </span>
                  </label>
                )
              })}
            </div>
            <p className="text-xs text-ink-2">
              Prochain prélèvement le 15 octobre 2026 : {eur2(planObj(s).p)}. Sans engagement, changement de formule immédiat.
            </p>
          </Panel>

          <Panel id="setSec" title="Sécurité & démo" bodyClassName="flex flex-wrap gap-2">
            <Button variant="outline" size="lg" onClick={() => toast('Le changement de mot de passe arrive avec la version connectée.')}>
              Changer le mot de passe
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                resetDemo()
                window.location.reload()
              }}
            >
              Réinitialiser les données de démo
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                mutate((d) => {
                  d.tours = {}
                })
                toast('Les tutoriels se relanceront sur chaque page')
                tour.start('parametres', true)
              }}
            >
              Rejouer tous les tutoriels
            </Button>
          </Panel>
        </div>
      </div>
    </>
  )
}
