import { useMemo, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { lockedOpps, sumV } from '@/lib/business'
import { eur } from '@/lib/format'
import { useAppState } from '@/lib/store'
import { Upsell } from '@/components/common'
import { DIFF } from '@/lib/ui-tokens'
import { DrawerContext, upgradeToCroissance, useDrawer, type DrawerApi, type DrawerState } from './context'
import { ClientSheet } from './client-sheet'
import { DrawerFrame, Box } from './frame'
import { ImportSheet } from './import-sheet'
import { OppComposer } from './opp-composer'

function UpgradeSheet() {
  const st = useAppState()
  const drawer = useDrawer()
  return (
    <DrawerFrame
      title="Formule Croissance"
      sub="24,99 € / mois · premier mois 12,49 €"
      footer={
        <Button variant="outline" size="lg" className="ml-auto" onClick={drawer.close}>
          Plus tard
        </Button>
      }
    >
      <Upsell
        title="Ce levier est réservé à la formule Croissance"
        text="Essentiel fait revenir les clientes perdues. Croissance ajoute les leviers qui font grandir la valeur de chaque cliente : cures, produits, ventes complémentaires, parrainage, plan de revenus sur 6 mois, messages personnalisables, WhatsApp, import par e-mail."
        diff={[DIFF.cures, DIFF.produits, DIFF.ventes, DIFF.parrainage, DIFF.plan, DIFF.wa]}
        onUpgrade={() => {
          upgradeToCroissance()
          drawer.close()
        }}
      />
      <Box soft>
        <p className="text-sm text-ink">
          <b>Pourquoi 9 € de plus changent tout :</b> une seule cure vendue (290 €) paie 11 mois de Croissance. Sur votre base actuelle, le potentiel
          verrouillé est de {eur(sumV(lockedOpps(st)))}.
        </p>
      </Box>
    </DrawerFrame>
  )
}

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DrawerState>(null)
  const [open, setOpen] = useState(false)

  const api = useMemo<DrawerApi>(() => {
    const show = (s: DrawerState) => {
      setState(s)
      setOpen(true)
    }
    return {
      state,
      openOpp: (id) => show({ kind: 'opp', id }),
      openClient: (id) => show({ kind: 'client', id }),
      openImport: () => show({ kind: 'import' }),
      openUpgrade: () => show({ kind: 'upgrade' }),
      close: () => setOpen(false),
    }
  }, [state])

  const key = state ? `${state.kind}-${'id' in state ? state.id : ''}` : 'none'

  return (
    <DrawerContext.Provider value={api}>
      {children}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full gap-0 bg-background p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-xl">
          <div key={key} className="flex h-full min-h-0 flex-col">
            {state?.kind === 'opp' && <OppComposer id={state.id} />}
            {state?.kind === 'client' && <ClientSheet id={state.id} />}
            {state?.kind === 'import' && <ImportSheet />}
            {state?.kind === 'upgrade' && <UpgradeSheet />}
          </div>
        </SheetContent>
      </Sheet>
    </DrawerContext.Provider>
  )
}
