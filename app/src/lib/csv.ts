import { FIELDS, SENSITIVE, type Client, type FieldKey } from './data'
import { initials } from './format'

export type ColumnMap = Partial<Record<FieldKey, number>>

export function parseCSV(input: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let q = false
  const text = input.replace(/^﻿/, '')
  const l0 = text.split('\n')[0]
  const sep = l0.split(';').length > l0.split(',').length ? ';' : ','
  const pushRow = () => {
    row.push(cell)
    if (row.some((x) => x.trim())) rows.push(row)
    row = []
    cell = ''
  }
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (q) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"'
          i++
        } else q = false
      } else cell += ch
    } else if (ch === '"') q = true
    else if (ch === sep) {
      row.push(cell)
      cell = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      pushRow()
    } else cell += ch
  }
  if (cell || row.length) pushRow()
  return rows
}

export const isSensitive = (h: string) => {
  const n = h.trim().toLowerCase()
  return SENSITIVE.some((s) => n.includes(s))
}

export function guessMap(headers: string[]): ColumnMap {
  const map: ColumnMap = {}
  headers.forEach((h, i) => {
    const n = h.trim().toLowerCase()
    if (isSensitive(h)) return
    FIELDS.forEach((f) => {
      if (map[f.k] !== undefined) return
      if (f.alts.includes(n) || f.alts.some((a) => n.includes(a) && a.length > 3)) map[f.k] = i
    })
  })
  // Correction : « Nom » + « Prénom » séparés (cas du modèle CSV) → Nom = nom de famille
  if (map.name !== undefined && map.first !== undefined && map.last === undefined && headers[map.name].trim().toLowerCase() === 'nom') {
    map.last = map.name
    delete map.name
  }
  return map
}

export function weeksSince(s: string): number | null {
  if (!s) return null
  let d: Date | null = null
  const m = String(s).match(/(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})/)
  if (m) {
    let y = +m[3]
    if (y < 100) y += 2000
    d = new Date(y, +m[2] - 1, +m[1])
  } else if (!isNaN(Date.parse(s))) d = new Date(s)
  else if (/^\d+$/.test(String(s).trim())) return +s
  if (!d || isNaN(d.getTime())) return null
  return Math.max(0, Math.round((Date.now() - d.getTime()) / (7 * 864e5)))
}

export function rowToClient(r: string[], map: ColumnMap): Omit<Client, 'id'> {
  const g = (k: FieldKey) => {
    const i = map[k]
    return i === undefined ? '' : String(r[i] || '').trim()
  }
  const name = g('name') || `${g('first')} ${g('last')}`.trim()
  const lastv = weeksSince(g('lastv'))
  const visits = parseInt(g('visits'), 10)
  const spent = parseFloat(g('spent').replace(/[^\d,.]/g, '').replace(',', '.'))
  return {
    name,
    ini: initials(name) || '??',
    phone: g('phone'),
    email: g('email'),
    last: lastv == null ? 4 : lastv,
    visits: isNaN(visits) ? 1 : visits,
    spent: isNaN(spent) ? 0 : Math.round(spent),
    fav: g('fav') || 'Prestation',
    services: g('fav') ? [g('fav')] : [],
    products: [],
    freq: 5,
    since: `import ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
    imported: true,
  }
}

export async function readCsvFile(f: File): Promise<string> {
  const buf = new Uint8Array(await f.arrayBuffer())
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buf)
  } catch {
    try {
      return new TextDecoder('windows-1252').decode(buf)
    } catch {
      return ''
    }
  }
}
