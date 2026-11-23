/* Données par défaut de l'outil (identiques à l'ancienne version HTML, clés br7_*) */

export type PlanKey = 'essentiel' | 'croissance'
export type OppType = 'reconquete' | 'cure' | 'produit' | 'panier' | 'parrainage'
export type Channel = 'sms' | 'wa' | 'email'
export type OppStatus = 'new' | 'sent' | 'done'

export interface Client {
  id: number
  name: string
  ini: string
  phone: string
  email: string
  since: string
  freq: number
  last: number
  visits: number
  spent: number
  fav: string
  services: string[]
  products: string[]
  imported?: boolean
}

export interface Opp {
  id: number
  c: number
  t: OppType
  v: number
  why: string
  offer: string
  st: OppStatus
  ch?: Channel
  at?: string
  draftSms?: string
  draftEmail?: string
  draftSubject?: string
}

export interface Template {
  sms: string
  subject: string
  email: string
}
export type Templates = Record<OppType, Template>

export interface Settings {
  name: string
  owner: string
  email: string
  phone: string
  city: string
  plan: PlanKey
  booking: string
  signature: string
  sender: string
  reminder: boolean
  utm: boolean
  lastImport: string
  lastImportSrc: string
  minutes: number
}

export interface LogEntry {
  id: string
  c: number
  o: number
  ch: Channel
  at: string
  st: 'sent' | 'done'
}

export type Tours = Partial<Record<string, boolean>>

export const DEMO = { id: 'demo@institut-lumiere.fr', pw: 'beauty2026' }

export const PLANS: Record<PlanKey, { n: string; p: number; first: number; max: number }> = {
  essentiel: { n: 'Essentiel', p: 15.99, first: 7.99, max: 300 },
  croissance: { n: 'Croissance', p: 24.99, first: 12.49, max: Infinity },
}

export const DEF_CLIENTS: Client[] = [
  { id: 1, name: 'Emma Martin', ini: 'EM', phone: '06 12 45 78 90', email: 'emma.martin@mail.fr', since: 'mars 2024', freq: 5, last: 8, visits: 11, spent: 742, fav: 'Soin visage hydratant', services: ['Soin visage hydratant', 'Épilation sourcils'], products: ['Crème hydratante nuit'] },
  { id: 2, name: 'Sophie Lambert', ini: 'SL', phone: '06 98 23 11 02', email: 'sophie.lambert@mail.fr', since: 'janvier 2025', freq: 4, last: 2, visits: 9, spent: 610, fav: 'Épilation jambes complètes', services: ['Épilation jambes complètes', 'Épilation maillot'], products: [] },
  { id: 3, name: 'Camille Bernard', ini: 'CB', phone: '07 45 66 12 34', email: 'camille.bernard@mail.fr', since: 'juin 2025', last: 0, freq: 6, visits: 4, spent: 296, fav: 'Soin visage éclat', services: ['Soin visage éclat'], products: ['Sérum vitamine C'] },
  { id: 4, name: 'Nadia Rahmani', ini: 'NR', phone: '06 33 90 21 87', email: 'nadia.rahmani@mail.fr', since: 'septembre 2023', last: 1, freq: 3, visits: 38, spent: 2860, fav: 'Manucure semi-permanent', services: ['Manucure semi-permanent', 'Pédicure', 'Soin visage anti-âge'], products: ['Huile cuticules', 'Crème mains'] },
  { id: 5, name: 'Julie Moreau', ini: 'JM', phone: '06 77 12 09 45', email: 'julie.moreau@mail.fr', since: 'novembre 2024', last: 10, freq: 6, visits: 6, spent: 390, fav: 'Massage relaxant', services: ['Massage relaxant'], products: [] },
  { id: 6, name: 'Inès Petit', ini: 'IP', phone: '07 02 55 43 10', email: 'ines.petit@mail.fr', since: 'février 2025', last: 1, freq: 4, visits: 8, spent: 520, fav: 'Manucure semi-permanent', services: ['Manucure semi-permanent'], products: [] },
  { id: 7, name: 'Léa Fontaine', ini: 'LF', phone: '06 41 88 76 33', email: 'lea.fontaine@mail.fr', since: 'mai 2024', last: 3, freq: 5, visits: 14, spent: 1120, fav: 'Soin visage anti-âge', services: ['Soin visage anti-âge', 'Épilation sourcils'], products: ['Crème anti-âge jour', 'Contour des yeux'] },
  { id: 8, name: 'Manon Girard', ini: 'MG', phone: '06 09 34 21 65', email: '', since: 'août 2025', last: 7, freq: 4, visits: 3, spent: 180, fav: 'Épilation demi-jambes', services: ['Épilation demi-jambes'], products: [] },
  { id: 9, name: 'Chloé Roux', ini: 'CR', phone: '07 66 21 09 88', email: 'chloe.roux@mail.fr', since: 'avril 2023', last: 1, freq: 4, visits: 27, spent: 2140, fav: 'Pédicure', services: ['Pédicure', 'Manucure', 'Soin corps gommage'], products: ['Gommage corps', 'Lait corps'] },
  { id: 10, name: 'Aurélie Blanc', ini: 'AB', phone: '', email: 'aurelie.blanc@mail.fr', since: 'octobre 2024', last: 2, freq: 6, visits: 7, spent: 455, fav: 'Soin visage hydratant', services: ['Soin visage hydratant'], products: [] },
]

/** tone : classes Tailwind du badge (fond teinté + texte foncé, contraste AA) ; col : couleur des graphiques */
export const TYPES: Record<OppType, { l: string; tone: string; col: string; d: string; ess?: boolean }> = {
  reconquete: { l: 'Reconquête', tone: 'bg-[#F7DDE6] text-[#7A2347]', col: '#B8426D', d: 'Clientes dont le rythme habituel de visite est rompu.', ess: true },
  cure: { l: 'Cure / forfait', tone: 'bg-[#E9DFEC] text-[#3E2646]', col: '#3E2646', d: 'Clientes qui répètent une prestation sans cure.' },
  produit: { l: 'Produits', tone: 'bg-[#F3E9DA] text-[#6B4F27]', col: '#C9A877', d: 'Routines à envoyer après un soin.' },
  panier: { l: 'Vente complémentaire', tone: 'bg-[#EFE3EA] text-[#6A3D5A]', col: '#8A5A7A', d: 'Prestations cohérentes jamais essayées.' },
  parrainage: { l: 'Parrainage', tone: 'bg-[#FBE9EE] text-[#8C3756]', col: '#EBB9C7', d: 'Clientes très fidèles à activer comme ambassadrices.' },
}
export const TYPE_KEYS = Object.keys(TYPES) as OppType[]

export const DEF_OPPS: Opp[] = [
  { id: 1, c: 1, t: 'reconquete', v: 65, why: 'Venait toutes les 5 sem. · absente depuis 8 sem.', offer: '-10 % sur votre prochain soin visage', st: 'new' },
  { id: 2, c: 2, t: 'cure', v: 290, why: '4 épilations jambes en 6 mois · cure non proposée', offer: 'Cure 6 séances à 290 € au lieu de 420 €, sur créneaux de semaine', st: 'new' },
  { id: 3, c: 3, t: 'produit', v: 84, why: 'Soin éclat la semaine dernière · routine recommandée à envoyer', offer: 'Sérum vitamine C + crème jour : 84 €, 2e produit -15 %', st: 'new' },
  { id: 4, c: 4, t: 'parrainage', v: 120, why: '38 visites · cliente fidèle depuis 3 ans', offer: '15 € offerts pour vous, 15 € pour votre filleule', st: 'new' },
  { id: 5, c: 5, t: 'reconquete', v: 75, why: 'Venait toutes les 6 sem. · absente depuis 10 sem.', offer: 'Massage 60 min au prix du 45 min', st: 'new' },
  { id: 6, c: 6, t: 'panier', v: 35, why: 'Manucure régulière · jamais de pédicure', offer: 'Duo manucure + pédicure : 55 € au lieu de 70 €', st: 'new' },
  { id: 7, c: 8, t: 'reconquete', v: 40, why: 'Nouvelle cliente · 1 visite · absente depuis 7 sem.', offer: 'Épilation sourcils offerte', st: 'new' },
  { id: 8, c: 9, t: 'parrainage', v: 120, why: "27 visites · 3 ans d'ancienneté", offer: '15 € offerts pour vous, 15 € pour votre filleule', st: 'new' },
  { id: 9, c: 10, t: 'cure', v: 250, why: 'Soin hydratant tous les 6 sem. · cure non proposée', offer: 'Cure 4 soins à 250 € au lieu de 320 €', st: 'new' },
  { id: 10, c: 7, t: 'produit', v: 68, why: 'Soin anti-âge il y a 3 sem. · contour des yeux à renouveler', offer: "Contour des yeux mis de côté à l'institut", st: 'sent', ch: 'sms', at: '29 sept.' },
  { id: 11, c: 7, t: 'panier', v: 45, why: 'Soin visage régulier · sourcils jamais ajoutés', offer: 'Sourcils à 15 € au lieu de 20 € avec votre soin', st: 'done', ch: 'email', at: '18 sept.' },
]

export const TPL_DEF: Templates = {
  reconquete: {
    sms: 'Bonjour {prenom}, cela fait un moment que nous ne vous avons pas vue à {institut} ! {offre}. Réservez votre créneau ici : {lien}',
    subject: '{prenom}, on pense à vous',
    email: "Bonjour {prenom},\n\nCela fait quelque temps que nous ne vous avons pas vue à {institut} et toute l'équipe serait ravie de vous retrouver.\n\nPour fêter votre retour : {offre}.\n\nRéservez votre créneau en un clic : {lien}\n\nÀ très vite,\n{signature}",
  },
  cure: {
    sms: 'Bonjour {prenom}, vous venez régulièrement pour votre {prestation}. Bonne nouvelle : {offre}. On en parle ? Réservez ici : {lien}',
    subject: 'Une cure pensée pour vous, {prenom}',
    email: "Bonjour {prenom},\n\nVous venez régulièrement à {institut} pour votre {prestation}. Pour vous faire gagner du temps et de l'argent : {offre}.\n\nRéservez votre prochaine séance et nous mettrons la cure en place ensemble : {lien}\n\nÀ bientôt,\n{signature}",
  },
  produit: {
    sms: 'Bonjour {prenom}, merci pour votre visite ! Voici la routine conseillée par votre esthéticienne : {offre}. Disponible à {institut}, ou réservez votre prochain soin : {lien}',
    subject: 'Votre routine après votre soin',
    email: "Bonjour {prenom},\n\nMerci pour votre visite à {institut}. Pour prolonger les effets de votre {prestation}, votre esthéticienne vous recommande : {offre}.\n\nLes produits vous attendent à l'institut. Vous pouvez aussi réserver votre prochain soin ici : {lien}\n\nBelle journée,\n{signature}",
  },
  panier: {
    sms: 'Bonjour {prenom}, pour votre prochaine {prestation} à {institut}, une petite idée : {offre}. Réservez ici : {lien}',
    subject: 'Une idée pour votre prochain rendez-vous',
    email: 'Bonjour {prenom},\n\nPour votre prochain rendez-vous à {institut}, nous avons pensé à vous : {offre}.\n\nRéservez votre créneau ici : {lien}\n\nÀ bientôt,\n{signature}',
  },
  parrainage: {
    sms: 'Bonjour {prenom}, merci pour votre fidélité à {institut} ! {offre}. Partagez ce lien à une amie : {lien}',
    subject: 'Merci {prenom} : une surprise pour vous et une amie',
    email: "Bonjour {prenom},\n\nVous faites partie de nos clientes les plus fidèles et nous tenions à vous remercier.\n\n{offre}. Il vous suffit de partager ce lien avec une amie, l'avantage s'applique dès sa première visite : {lien}\n\nMerci encore,\n{signature}",
  },
}

export const DEF_SETTINGS: Settings = {
  name: 'Institut Lumière',
  owner: 'Léa Dumont',
  email: 'demo@institut-lumiere.fr',
  phone: '01 42 55 09 18',
  city: 'Paris 11e',
  plan: 'croissance',
  booking: 'https://www.planity.com/institut-lumiere-75011-paris',
  signature: "Léa et l'équipe de l'Institut Lumière\n01 42 55 09 18",
  sender: 'Institut Lumière',
  reminder: true,
  utm: true,
  lastImport: '1er octobre 2026',
  lastImportSrc: 'Planity · 10 clientes',
  minutes: 4.33,
}

export const DEF_LOG: LogEntry[] = [
  { id: 'L1', c: 7, o: 10, ch: 'sms', at: '29 sept. 2026, 09:12', st: 'sent' },
  { id: 'L2', c: 7, o: 11, ch: 'email', at: '18 sept. 2026, 10:04', st: 'done' },
]

export const CURES = [
  { n: 'Cure épilation jambes · 6 séances', p: 290, ref: 420, elig: [2, 8] },
  { n: 'Cure soin hydratant · 4 soins', p: 250, ref: 320, elig: [10, 1] },
  { n: 'Cure anti-âge · 5 soins', p: 390, ref: 475, elig: [7] },
  { n: 'Forfait manucure · 5 poses', p: 180, ref: 225, elig: [6, 4] },
]

export const MONTHS = ['Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.']
export const CA = [920, 1180, 1360, 1050, 1610, 1840]
/** CA bonus du mois en cours (démo) */
export const CA_MONTH = 1840

export const CHANNEL_LABEL: Record<Channel, string> = { sms: 'SMS', wa: 'WhatsApp', email: 'E-mail' }

/* Import */
export type SourceKey = 'planity' | 'kiute' | 'treatwell' | 'excel'
export const SOURCES: Record<SourceKey, { n: string; bg: string; steps: string[] }> = {
  planity: { n: 'Planity', bg: '#2D2A6E', steps: ['Dans Planity Pro, ouvrez « Clients ».', 'En haut à droite, cliquez sur « Exporter » (format CSV ou Excel).', 'Enregistrez le fichier, puis déposez-le ci-dessous.'] },
  kiute: { n: 'Kiute', bg: '#B8426D', steps: ['Dans Kiute Pro, allez dans « Fichier clients ».', 'Choisissez « Exporter la liste » et sélectionnez toutes les colonnes.', 'Enregistrez le fichier CSV, puis déposez-le ci-dessous.'] },
  treatwell: { n: 'Treatwell', bg: '#B5473D', steps: ['Dans Treatwell Pro, ouvrez « Clients ».', 'Cliquez sur « Exporter les clients ».', 'Enregistrez le fichier CSV, puis déposez-le ci-dessous.'] },
  excel: { n: 'Excel / CSV', bg: '#1E7E4D', steps: ['Une ligne par cliente, avec une colonne par information.', 'Colonnes reconnues : nom, prénom, téléphone, e-mail, dernière visite, nombre de visites, total dépensé, prestation.', 'Enregistrez en CSV (séparateur ; ou ,), puis déposez le fichier ci-dessous.'] },
}

export type FieldKey = 'name' | 'first' | 'last' | 'phone' | 'email' | 'lastv' | 'visits' | 'spent' | 'fav'
export const FIELDS: { k: FieldKey; l: string; alts: string[] }[] = [
  { k: 'name', l: 'Nom complet', alts: ['nom complet', 'nom', 'client', 'cliente', 'name', 'full name'] },
  { k: 'first', l: 'Prénom', alts: ['prénom', 'prenom', 'first name', 'firstname'] },
  { k: 'last', l: 'Nom de famille', alts: ['nom de famille', 'last name', 'lastname', 'surname'] },
  { k: 'phone', l: 'Téléphone', alts: ['téléphone', 'telephone', 'tel', 'tél', 'mobile', 'portable', 'phone', 'gsm'] },
  { k: 'email', l: 'E-mail', alts: ['email', 'e-mail', 'mail', 'courriel'] },
  { k: 'lastv', l: 'Dernière visite', alts: ['dernière visite', 'derniere visite', 'last visit', 'dernier rdv', 'dernier rendez-vous'] },
  { k: 'visits', l: 'Nombre de visites', alts: ['visites', 'nombre de visites', 'visits', 'rdv', 'rendez-vous'] },
  { k: 'spent', l: 'Total dépensé', alts: ['total', 'dépensé', 'depense', 'ca', 'chiffre', 'montant', 'spent', 'total dépensé'] },
  { k: 'fav', l: 'Prestation favorite', alts: ['prestation', 'prestation favorite', 'service', 'soin', 'favorite'] },
]
export const SENSITIVE = ['allergie', 'santé', 'sante', 'grossesse', 'médic', 'medic', 'traitement', 'pathologie', 'note', 'commentaire', 'naissance', 'âge', 'age']

export const CSV_MODEL =
  'Nom;Prénom;Téléphone;E-mail;Dernière visite;Nombre de visites;Total dépensé;Prestation favorite\nMartin;Emma;06 12 45 78 90;emma.martin@mail.fr;05/08/2026;11;742;Soin visage hydratant\nLambert;Sophie;06 98 23 11 02;sophie.lambert@mail.fr;18/09/2026;9;610;Épilation jambes complètes'

export const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T
