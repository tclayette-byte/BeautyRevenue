import { fmt } from '@/lib/format'

export function BarChart({ labels, values }: { labels: string[]; values: number[] }) {
  const W = 520
  const H = 210
  const max = Math.max(...values) * 1.15
  const bw = 50
  const gap = (W - 40 - bw * values.length) / (values.length - 1)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="CA bonus par mois">
      <title>CA bonus par mois</title>
      {values.map((v, i) => {
        const h = (v / max) * (H - 54)
        const x = 20 + i * (bw + gap)
        const y = H - 30 - h
        const last = i === values.length - 1
        return (
          <g key={labels[i]}>
            <rect x={x} y={y} width={bw} height={h} rx={8} fill={last ? '#B8426D' : '#3E2646'} opacity={last ? 1 : 0.85} />
            <text x={x + bw / 2} y={y - 8} textAnchor="middle" className="fill-ink text-[13px] font-semibold">
              {fmt(v)}
            </text>
            <text x={x + bw / 2} y={H - 9} textAnchor="middle" className="fill-ink-2 text-[12px]">
              {labels[i]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function Donut({ parts, total }: { parts: { k: string; v: number; col: string }[]; total: number }) {
  const R = 54
  const C = 2 * Math.PI * R
  const offsets = parts.map((_, i) => parts.slice(0, i).reduce((a, p) => a + (total ? (p.v / total) * C : 0), 0))
  return (
    <svg viewBox="0 0 140 140" width="140" height="140" aria-hidden="true" className="shrink-0">
      <circle r={R} cx="70" cy="70" fill="none" stroke="#F1E8EC" strokeWidth="18" />
      {parts.map((p, i) => {
        const d = total ? (p.v / total) * C : 0
        return (
          <circle
            key={p.k}
            r={R}
            cx="70"
            cy="70"
            fill="none"
            stroke={p.col}
            strokeWidth="18"
            strokeDasharray={`${d} ${C - d}`}
            strokeDashoffset={-offsets[i]}
            transform="rotate(-90 70 70)"
          />
        )
      })}
      <text x="70" y="68" textAnchor="middle" className="fill-ink text-[17px] font-semibold">
        {fmt(total)} €
      </text>
      <text x="70" y="85" textAnchor="middle" className="fill-ink-2 text-[10px]">
        potentiel
      </text>
    </svg>
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
