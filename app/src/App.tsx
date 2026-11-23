import { useEffect } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppShell } from '@/components/app-shell'
import { go, parseRoute, useHash } from '@/lib/router'
import { isAuth } from '@/lib/store'
import type { PageKey } from '@/lib/tours'
import { LoginPage } from '@/pages/login'
import { DashboardPage } from '@/pages/dashboard'
import { OpportunitesPage } from '@/pages/opportunites'
import { PlanPage } from '@/pages/plan'
import { ClientesPage } from '@/pages/clientes'
import { EnvoisPage } from '@/pages/envois'
import { PerformancePage } from '@/pages/performance'
import { ParametresPage } from '@/pages/parametres'

const PAGE_COMPONENTS: Record<PageKey, () => React.JSX.Element> = {
  dashboard: DashboardPage,
  opportunites: OpportunitesPage,
  plan: PlanPage,
  clientes: ClientesPage,
  envois: EnvoisPage,
  performance: PerformancePage,
  parametres: ParametresPage,
}

const TITLES: Record<PageKey, string> = {
  dashboard: "Vue d'ensemble",
  opportunites: 'Opportunités',
  plan: 'Plan de revenus',
  clientes: 'Clientes',
  envois: 'Envois & messages',
  performance: 'Performance',
  parametres: 'Paramètres',
}

export default function App() {
  const hash = useHash()
  const route = parseRoute(hash)
  const authed = isAuth()

  // Garde de session et redirections
  const redirect = route.view === 'app' ? (authed ? null : '#/connexion') : authed ? '#/app' : hash.startsWith('#/connexion') ? null : '#/connexion'
  useEffect(() => {
    if (redirect) go(redirect)
  }, [redirect])

  const pageKey = route.view === 'app' ? route.page : null
  useEffect(() => {
    document.title = pageKey ? `${TITLES[pageKey]} · BeautyRevenue` : 'Connexion · BeautyRevenue'
    window.scrollTo(0, 0)
  }, [pageKey])

  let content: React.ReactNode = null
  if (!redirect) {
    if (route.view === 'app') {
      const Page = PAGE_COMPONENTS[route.page]
      content = (
        <AppShell page={route.page}>
          <Page />
        </AppShell>
      )
    } else content = <LoginPage />
  }

  return (
    <TooltipProvider>
      {content}
      <Toaster theme="light" position="bottom-center" />
    </TooltipProvider>
  )
}
