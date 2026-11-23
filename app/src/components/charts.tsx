import { Bar, BarChart as RBarChart, Cell, Label, LabelList, Pie, PieChart, XAxis, YAxis } from 'recharts'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { fmt } from '@/lib/format'

const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const euro = (v: unknown) => `${fmt(Number(v))} €`

/* CA bonus par mois : barres verticales, le dernier mois mis en avant */
const barConfig = {
  v: { label: 'CA bonus', color: 'var(--chart-2)' },
  last: { label: 'Mois en cours', color: 'var(--chart-1)' },
} satisfies ChartConfig

export function BarChart({ labels, values }: { labels: string[]; values: number[] }) {
  const data = labels.map((m, i) => ({ m, v: values[i] }))
  return (
    <ChartContainer config={barConfig} className="aspect-auto h-[240px] w-full" aria-label="CA bonus par mois">
      <RBarChart data={data} margin={{ top: 28, right: 4, left: 4, bottom: 0 }}>
        <XAxis dataKey="m" tickLine={false} axisLine={false} tickMargin={10} />
        <ChartTooltip cursor={{ fill: 'var(--muted)', radius: 10 }} content={<ChartTooltipContent hideIndicator formatter={(v) => <span className="font-semibold tabular-nums">{euro(v)}</span>} />} />
        <Bar dataKey="v" radius={10} maxBarSize={64} isAnimationActive={!reduce} animationDuration={900}>
          {data.map((d, i) => (
            <Cell key={d.m} fill={i === data.length - 1 ? 'var(--color-last)' : 'var(--color-v)'} fillOpacity={i === data.length - 1 ? 1 : 0.85} />
          ))}
          <LabelList dataKey="v" position="top" offset={10} className="fill-foreground text-[13px] font-semibold" formatter={(v: unknown) => fmt(Number(v))} />
        </Bar>
      </RBarChart>
    </ChartContainer>
  )
}

/* Potentiel par levier : anneau avec total au centre */
export function Donut({ parts, total }: { parts: { k: string; v: number; col: string; l?: string }[]; total: number }) {
  const config = Object.fromEntries(parts.map((p) => [p.k, { label: p.l ?? p.k, color: p.col }])) satisfies ChartConfig
  const data = parts.map((p) => ({ k: p.k, v: p.v, fill: `var(--color-${p.k})` }))
  return (
    <ChartContainer config={config} className="aspect-square h-[170px] shrink-0">
      <PieChart>
        <ChartTooltip cursor={false} content={<ChartTooltipContent nameKey="k" hideLabel formatter={(v, _n, item) => (
          <div className="flex w-full items-center gap-2">
            <i className="size-2.5 shrink-0 rounded-full" style={{ background: (item.payload as { fill: string }).fill }} />
            <span className="text-muted-foreground">{config[(item.payload as { k: string }).k]?.label}</span>
            <b className="ml-auto font-semibold tabular-nums">{euro(v)}</b>
          </div>
        )} />} />
        <Pie data={data} dataKey="v" nameKey="k" innerRadius={56} outerRadius={80} strokeWidth={3} stroke="var(--card)" paddingAngle={1} isAnimationActive={!reduce} animationDuration={900}>
          <Label
            content={({ viewBox }) => {
              if (!viewBox || !('cx' in viewBox)) return null
              return (
                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                  <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) - 6} className="fill-foreground text-lg font-semibold">{fmt(total)} €</tspan>
                  <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 14} className="fill-muted-foreground text-xs">potentiel</tspan>
                </text>
              )
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}

/* Répartition par levier : barres horizontales */
export function HBarChart({ items }: { items: { k: string; l: string; v: number; col: string; note?: string }[] }) {
  const config = Object.fromEntries(items.map((x) => [x.k, { label: x.l, color: x.col }])) satisfies ChartConfig
  const data = items.map((x) => ({ k: x.k, l: x.l, v: x.v, note: x.note, fill: `var(--color-${x.k})` }))
  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height: items.length * 46 + 10 }}>
      <RBarChart data={data} layout="vertical" margin={{ top: 0, right: 64, left: 0, bottom: 0 }} barCategoryGap={10}>
        <YAxis dataKey="l" type="category" tickLine={false} axisLine={false} width={150} tick={{ fontSize: 13 }} />
        <XAxis type="number" dataKey="v" hide />
        <ChartTooltip cursor={false} content={<ChartTooltipContent nameKey="k" hideLabel formatter={(v, _n, item) => (
          <div className="flex w-full items-center gap-2">
            <span className="text-muted-foreground">{(item.payload as { l: string }).l}</span>
            <b className="ml-auto font-semibold tabular-nums">{euro(v)}</b>
          </div>
        )} />} />
        <Bar dataKey="v" radius={8} isAnimationActive={!reduce} animationDuration={900}>
          <LabelList dataKey="v" position="right" offset={8} className="fill-foreground text-[13px] font-semibold" formatter={(v: unknown) => euro(v)} />
        </Bar>
      </RBarChart>
    </ChartContainer>
  )
}

export function Legend({ items }: { items: { col: string; l: string; v: string; muted?: boolean }[] }) {
  return (
    <ul className="grid min-w-[180px] flex-1 gap-2 text-sm">
      {items.map((x) => (
        <li key={x.l} className={`flex items-center gap-2 ${x.muted ? 'text-ink-2' : 'text-ink'}`}>
          <i className="size-2.5 shrink-0 rounded-full" style={{ background: x.col }} aria-hidden="true" />
          <span className="flex-1">{x.l}</span>
          <b className="font-semibold tabular-nums">{x.v}</b>
        </li>
      ))}
    </ul>
  )
}
