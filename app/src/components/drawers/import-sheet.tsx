import { useState } from 'react'
import { toast } from 'sonner'
import { Download, Info, Timer, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { CSV_MODEL, FIELDS, SOURCES, type SourceKey } from '@/lib/data'
import { downloadCsv, normPhone, planObj } from '@/lib/business'
import { guessMap, isSensitive, parseCSV, readCsvFile, rowToClient, type ColumnMap } from '@/lib/csv'
import { eur } from '@/lib/format'
import { go } from '@/lib/router'
import { KEYS, ls, mutate, setUi, useAppState } from '@/lib/store'
import { useDrawer } from './context'
import { Box, DrawerFrame } from './frame'

const IGNORE = '__ignore'

export function ImportSheet() {
  const st = useAppState()
  const drawer = useDrawer()
  const [src, setSrc] = useState<SourceKey>(() => {
    const v = ls.get<SourceKey>(KEYS.src)
    return v && v in SOURCES ? v : 'planity'
  })
  const [rows, setRows] = useState<string[][] | null>(null)
  const [map, setMap] = useState<ColumnMap>({})
  const [fileName, setFileName] = useState('')
  const [ok, setOk] = useState(false)
  const [over, setOver] = useState(false)

  const s = SOURCES[src]
  const cap = planObj(st.settings).max
  const nRows = rows ? rows.length - 1 : 0
  const overCap = !!rows && cap !== Infinity && st.clients.length + nRows > cap
  const ignored = rows ? rows[0].filter(isSensitive) : []

  const readFile = async (f?: File) => {
    if (!f) return
    if (f.size > 5 * 1024 * 1024) {
      toast('Fichier trop volumineux (5 Mo max)')
      return
    }
    const parsed = parseCSV(await readCsvFile(f))
    if (!parsed || parsed.length < 2) {
      toast('Fichier vide ou illisible')
      setRows(null)
      return
    }
    setFileName(f.name)
    setMap(guessMap(parsed[0]))
    setRows(parsed)
  }

  const doImport = () => {
    if (!rows) return
    let added = 0
    let merged = 0
    mutate((d) => {
      let maxId = d.clients.reduce((m, c) => Math.max(m, c.id), 0)
      rows.slice(1).forEach((r) => {
        const c = rowToClient(r, map)
        if (!c.name) return
        const np = normPhone(c.phone)
        const ex = d.clients.find((x) => (np && normPhone(x.phone) === np) || (c.email && x.email && x.email.toLowerCase() === c.email.toLowerCase()))
        if (ex) {
          if (!ex.phone && c.phone) ex.phone = c.phone
          if (!ex.email && c.email) ex.email = c.email
          if (c.spent > ex.spent) ex.spent = c.spent
          if (c.visits > ex.visits) ex.visits = c.visits
          merged++
        } else {
          d.clients.push({ ...c, id: ++maxId })
          added++
        }
      })
      d.settings.lastImport = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      d.settings.lastImportSrc = `${SOURCES[src].n} · ${added} nouvelles, ${merged} fusionnées`
      d.settings.minutes = Math.min(5, (d.settings.minutes || 0) + 2)
    })
    drawer.close()
    toast(`${added} clientes importées, ${merged} fusionnées · 2 minutes, c'est fait pour ce mois`)
    setUi({ tab: 'liste' })
    go('#/app/clientes')
  }

  return (
    <DrawerFrame
      title="Importer ma base de données client"
      sub="Planity, Kiute, Treatwell ou Excel · fichier CSV · 2 minutes"
      footer={
        <>
          <Button size="lg" disabled={!rows || !ok || overCap} onClick={doImport}>
            {rows ? `Importer ${nRows} clientes` : 'Importer'}
          </Button>
          <Button variant="outline" size="lg" className="ml-auto" onClick={drawer.close}>
            Annuler
          </Button>
        </>
      }
    >
      <Box soft>
        <div className="flex gap-3 text-sm">
          <Timer className="mt-0.5 size-5 shrink-0 text-rose" aria-hidden="true" />
          <div className="grid gap-0.5">
            <b className="font-semibold text-ink">Votre rituel du mois : 2 minutes.</b>
            <span className="text-ink-2">
              Un import par mois suffit : les leviers se jouent à l'échelle de semaines, pas d'heures. Dernier import : {st.settings.lastImport}.
            </span>
          </div>
        </div>
      </Box>

      <div className="grid gap-2">
        <span className="text-sm font-semibold text-ink">1. D'où vient votre base ?</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(Object.keys(SOURCES) as SourceKey[]).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={k === src}
              onClick={() => {
                setSrc(k)
                ls.set(KEYS.src, k)
              }}
              className={cn(
                'flex items-center gap-2 rounded-xl border bg-card p-2.5 text-left text-sm font-medium text-ink transition-colors hover:border-blush focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none',
                k === src && 'border-rose ring-1 ring-rose',
              )}
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-md text-xs font-semibold text-white" style={{ background: SOURCES[k].bg }} aria-hidden="true">
                {SOURCES[k].n.charAt(0)}
              </span>
              {SOURCES[k].n}
            </button>
          ))}
        </div>
      </div>

      <Box soft title={`2. Exporter depuis ${s.n}`}>
        <ol className="grid list-decimal gap-1 pl-5 text-sm text-ink">
          {s.steps.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ol>
        {src !== 'excel' && (
          <p className="text-xs text-ink-2">
            Les intitulés exacts peuvent varier selon la version de {s.n}. Tout export CSV ou Excel enregistré en CSV fonctionne. Aucun accès à votre compte n'est demandé.
          </p>
        )}
      </Box>

      <div className="grid gap-2">
        <span className="text-sm font-semibold text-ink">3. Déposer le fichier</span>
        <label
          onDragEnter={(e) => {
            e.preventDefault()
            setOver(true)
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setOver(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            setOver(false)
          }}
          onDrop={(e) => {
            e.preventDefault()
            setOver(false)
            void readFile(e.dataTransfer.files[0])
          }}
          className={cn(
            'grid cursor-pointer place-items-center gap-1 rounded-xl border-2 border-dashed bg-card px-4 py-6 text-center transition-colors focus-within:ring-3 focus-within:ring-ring/40 hover:border-blush',
            over && 'border-rose bg-accent',
          )}
        >
          <input type="file" accept=".csv,text/csv,.txt" className="sr-only" onChange={(e) => void readFile(e.target.files?.[0])} />
          <Upload className="size-6 text-rose" aria-hidden="true" />
          <b className="font-semibold text-ink">{fileName || 'Glissez votre fichier CSV ici'}</b>
          <span className="text-xs text-ink-2">{rows ? `${nRows} lignes détectées` : 'ou cliquez pour le sélectionner · 5 Mo max'}</span>
        </label>
        <div>
          <Button variant="outline" size="sm" onClick={() => downloadCsv('modele-import-beautyrevenue.csv', CSV_MODEL)}>
            <Download aria-hidden="true" />
            Télécharger un modèle CSV
          </Button>
        </div>
      </div>

      {rows && (
        <>
          <Box title="4. Correspondance des colonnes">
            <p className="text-xs text-ink-2">BeautyRevenue a reconnu automatiquement les colonnes. Vérifiez et ajustez si besoin.</p>
            <div className="grid gap-2">
              {FIELDS.map((f) => (
                <div key={f.k} className="grid grid-cols-[1fr_auto_1.3fr] items-center gap-2 text-sm">
                  <span className="text-ink">{f.l}</span>
                  <span className="text-ink-2" aria-hidden="true">
                    ←
                  </span>
                  <Select
                    value={map[f.k] === undefined ? IGNORE : String(map[f.k])}
                    onValueChange={(v) =>
                      setMap((m) => {
                        const n = { ...m }
                        if (v === IGNORE) delete n[f.k]
                        else n[f.k] = +v
                        return n
                      })
                    }
                  >
                    <SelectTrigger className="w-full min-w-0 bg-card" aria-label={`Colonne pour ${f.l}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={IGNORE}>— ignorer —</SelectItem>
                      {rows[0].map((h, i) => (
                        <SelectItem key={i} value={String(i)}>
                          {h || `(colonne ${i + 1})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            {ignored.length > 0 && (
              <p className="text-xs font-semibold text-warn">Colonnes ignorées (données sensibles, non importées) : {ignored.join(', ')}.</p>
            )}
          </Box>

          <Box title={<>Aperçu <span className="text-xs font-normal text-ink-2">5 premières lignes sur {nRows}</span></>}>
            <ul className="grid gap-2 sm:hidden">
              {rows.slice(1, 6).map((r, i) => {
                const c = rowToClient(r, map)
                return (
                  <li key={i} className="grid gap-0.5 rounded-lg bg-muted p-2.5 text-sm">
                    <b className="font-semibold text-ink">{c.name || '—'}</b>
                    <span className="text-ink-2">
                      {c.phone || '—'} · {c.email || '—'}
                    </span>
                    <span className="text-ink-2">
                      {c.last} sem. · {c.visits} visites · {eur(c.spent)}
                    </span>
                  </li>
                )
              })}
            </ul>
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Dern. visite</TableHead>
                    <TableHead className="text-right">Visites</TableHead>
                    <TableHead className="text-right">Dépensé</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.slice(1, 6).map((r, i) => {
                    const c = rowToClient(r, map)
                    return (
                      <TableRow key={i}>
                        <TableCell>{c.name}</TableCell>
                        <TableCell>{c.phone || '—'}</TableCell>
                        <TableCell>{c.email || '—'}</TableCell>
                        <TableCell>{c.last} sem.</TableCell>
                        <TableCell className="text-right">{c.visits}</TableCell>
                        <TableCell className="text-right">{eur(c.spent)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </Box>

          <label className="flex items-start gap-3 rounded-xl bg-muted p-3 text-sm text-ink-2">
            <Checkbox checked={ok} onCheckedChange={(v) => setOk(v === true)} className="mt-0.5 bg-card" />
            <span>
              Je confirme être responsable du traitement de ces données et avoir informé mes clientes que leurs coordonnées peuvent servir à des
              communications de mon institut. Chaque message envoyé inclura une possibilité de désinscription.
            </span>
          </label>

          {overCap && (
            <Box className="border-warn">
              <p className="text-sm text-ink">
                <b>Limite Essentiel : {cap} clientes.</b> Vous en auriez {st.clients.length + nRows} après import. Passez en Croissance pour une base
                illimitée, ou importez une sélection.
              </p>
            </Box>
          )}
        </>
      )}

      <div className="flex gap-2 rounded-xl border bg-card p-3 text-sm text-ink-2">
        <Info className="mt-0.5 size-4 shrink-0 text-rose" aria-hidden="true" />
        <span>
          Les doublons sont fusionnés sur le téléphone ou l'e-mail. Les colonnes sensibles (santé, allergies, notes, date de naissance) ne sont jamais
          importées. Données hébergées en France dans la version connectée.
        </span>
      </div>
    </DrawerFrame>
  )
}
