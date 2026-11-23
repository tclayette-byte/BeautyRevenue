import type { ReactNode } from 'react'
import { toast } from 'sonner'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeft,
  CircleHelp,
  Euro,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  Send,
  Settings as SettingsIcon,
  Sparkles,
  TrendingUp,
  Upload,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from '@/components/ui/sidebar'
import { eur, eur2, fmt, initials } from '@/lib/format'
import { CA_MONTH } from '@/lib/data'
import { isCro, planObj, roi, todoOpps } from '@/lib/business'
import { SITE_URL, go } from '@/lib/router'
import { clearSession, useAppState, type AppState } from '@/lib/store'
import type { PageKey } from '@/lib/tours'
import { Logo } from '@/components/common'
import { DrawerProvider } from '@/components/drawers/drawer-provider'
import { useDrawer } from '@/components/drawers/context'
import { TourProvider } from '@/components/tour/tour-provider'
import { useTour } from '@/components/tour/context'

type NavItem = { k: PageKey; l: string; icon: LucideIcon; cro?: boolean; cnt?: (s: AppState) => number }
const NAV: { g: string; items: NavItem[] }[] = [
  {
    g: 'Pilotage',
    items: [
      { k: 'dashboard', l: "Vue d'ensemble", icon: LayoutDashboard },
      { k: 'opportunites', l: 'Opportunités', icon: Sparkles, cnt: (s) => todoOpps(s).length },
      { k: 'plan', l: 'Plan de revenus', icon: TrendingUp, cro: true },
    ],
  },
  {
    g: 'Relation client',
    items: [
      { k: 'clientes', l: 'Clientes', icon: Users },
      { k: 'envois', l: 'Envois & messages', icon: Send },
    ],
  },
  {
    g: 'Compte',
    items: [
      { k: 'performance', l: 'Performance', icon: Euro },
      { k: 'parametres', l: 'Paramètres', icon: SettingsIcon },
    ],
  },
]
const LABEL = Object.fromEntries(NAV.flatMap((g) => g.items.map((i) => [i.k, i.l]))) as Record<PageKey, string>

function AppSidebar({ page }: { page: PageKey }) {
  const st = useAppState()
  const { setOpenMobile } = useSidebar()
  const s = st.settings
  const plan = planObj(s)

  const logout = () => {
    clearSession()
    toast('Vous êtes déconnectée')
    go('#/connexion')
  }

  return (
    <Sidebar collapsible="offcanvas" className="border-r-0">
      <SidebarHeader className="gap-4 px-4 pt-5">
        <a href="#/app/dashboard" onClick={() => setOpenMobile(false)} aria-label="BeautyRevenue, vue d'ensemble">
          <Logo light />
        </a>
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.06] p-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-blush text-xs font-semibold text-night">{initials(s.name)}</span>
          <div className="grid min-w-0 text-sm">
            <b className="truncate font-semibold text-white">{s.name}</b>
            <span className="truncate text-xs text-sidebar-foreground/75">
              {s.city} · Formule {plan.n}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent id="boNav" className="px-2">
        {NAV.map((grp) => (
          <SidebarGroup key={grp.g}>
            <SidebarGroupLabel className="text-sidebar-foreground/65">{grp.g}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {grp.items.map((it) => {
                  const lock = it.cro && !isCro(s)
                  const n = it.cnt ? it.cnt(st) : 0
                  return (
                    <SidebarMenuItem key={it.k}>
                      <SidebarMenuButton
                        asChild
                        isActive={page === it.k}
                        size="lg"
                        className="h-10 text-[0.92rem] text-sidebar-foreground/90 data-active:bg-sidebar-accent data-active:font-semibold data-active:text-white"
                      >
                        <a href={`#/app/${it.k}`} data-nav={it.k} onClick={() => setOpenMobile(false)} aria-current={page === it.k ? 'page' : undefined}>
                          <it.icon aria-hidden="true" />
                          <span>{it.l}</span>
                        </a>
                      </SidebarMenuButton>
                      {lock ? (
                        <SidebarMenuBadge className="top-2.5 gap-1 rounded-full bg-white/10 px-2 text-[0.7rem] text-blush">
                          <Lock className="size-3" aria-hidden="true" />
                          Croissance
                        </SidebarMenuBadge>
                      ) : n ? (
                        <SidebarMenuBadge className="top-2.5 rounded-full bg-rose px-2 text-[0.72rem] text-white" aria-label={`${n} à traiter`}>
                          {n}
                        </SidebarMenuBadge>
                      ) : null}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="gap-3 p-4">
        <div className="grid gap-0.5 rounded-xl bg-plum p-3 text-xs">
          <b className="font-semibold text-white">
            Formule {plan.n} · {eur2(plan.p)}/mois
          </b>
          <span className="text-sidebar-foreground/80">
            CA bonus ce mois : {eur(CA_MONTH)} ({fmt(roi(s))}×)
          </span>
        </div>
        <Button variant="outline" size="lg" className="w-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={logout}>
          <LogOut aria-hidden="true" />
          Se déconnecter
        </Button>
        <a href={SITE_URL} className="inline-flex items-center gap-1.5 text-xs text-sidebar-foreground/75 hover:text-white">
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Retour au site
        </a>
      </SidebarFooter>
    </Sidebar>
  )
}

function TopBar({ page }: { page: PageKey }) {
  const st = useAppState()
  const { toggleSidebar } = useSidebar()
  const drawer = useDrawer()
  const tour = useTour()
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/90 px-3 backdrop-blur md:px-6">
      <Button id="sideOpen" variant="ghost" size="icon-lg" onClick={toggleSidebar} aria-label="Menu" className="text-ink">
        <Menu aria-hidden="true" />
      </Button>
      <nav aria-label="Fil d'Ariane" className="min-w-0 flex-1 truncate text-sm text-ink-2">
        <span className="hidden sm:inline">BeautyRevenue › </span>
        <b className="font-semibold text-ink">{LABEL[page]}</b>
      </nav>
      <Button size="lg" onClick={drawer.openImport} className="shrink-0">
        <Upload aria-hidden="true" />
        <span className="hidden xl:inline">Importer ma base de données client (Planity, Kiute…)</span>
        <span className="xl:hidden">Importer</span>
      </Button>
      <Button id="howBtn" variant="outline" size="lg" onClick={() => tour.start(page, true)} className="shrink-0" aria-label="Comment ça marche ?">
        <CircleHelp aria-hidden="true" />
        <span className="hidden md:inline">Comment ça marche ?</span>
      </Button>
      <a href="#/app/parametres" className="hidden items-center gap-2 rounded-lg px-1.5 py-1 text-sm font-medium text-ink hover:bg-muted lg:flex">
        <span className="grid size-8 place-items-center rounded-full bg-plum text-xs font-semibold text-white">{initials(st.settings.owner)}</span>
        {st.settings.owner}
      </a>
    </header>
  )
}

export function AppShell({ page, children }: { page: PageKey; children: ReactNode }) {
  return (
    <SidebarProvider className="bg-background" style={{ '--sidebar-width': '16.5rem' } as React.CSSProperties}>
      <DrawerProvider>
        <TourProvider page={page}>
          <AppSidebar page={page} />
          <SidebarInset className="min-w-0 bg-background">
            <TopBar page={page} />
            <main key={page} className="br-page mx-auto grid w-full max-w-6xl min-w-0 grid-cols-[minmax(0,1fr)] gap-6 px-4 py-6 md:px-8 md:py-8">
              {children}
            </main>
          </SidebarInset>
        </TourProvider>
      </DrawerProvider>
    </SidebarProvider>
  )
}
