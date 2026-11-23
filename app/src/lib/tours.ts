export type PageKey = 'dashboard' | 'opportunites' | 'plan' | 'clientes' | 'envois' | 'performance' | 'parametres'

export interface TourStep {
  /** sélecteurs CSS séparés par des virgules : le premier élément trouvé est mis en avant */
  sel: string
  /** étape qui pointe la navigation latérale (sur mobile, on pointe le bouton menu) */
  side?: boolean
  t: string
  d: string
}

export const TOURS: Record<PageKey, TourStep[]> = {
  dashboard: [
    { sel: '#cycle', t: 'Tout commence par votre import mensuel', d: "Une fois par mois, vous déposez l'export de votre logiciel ici : 2 minutes. C'est à partir de ce fichier que les opportunités sont calculées. Le compteur de temps vous montre ce que rapportent vos 5 minutes." },
    { sel: '#boNav', side: true, t: 'Votre navigation', d: "Pilotage (ce qu'il y a à faire et à gagner), Relation client (vos clientes et vos messages), Compte (résultats et réglages). Le badge indique le nombre d'opportunités en attente." },
    { sel: '#dashKpis', t: 'Vos chiffres du mois', d: "Le premier chiffre est le seul qui compte : le CA bonus réellement généré. À côté, le retour sur abonnement : avec une formule à moins de 25 €, une seule cliente revenue le rembourse." },
    { sel: '#dashTodo', t: 'À traiter ce mois-ci', d: "Les opportunités les plus rentables de votre dernier import. Cliquez sur une ligne : le message, l'offre et le lien de réservation sont prêts. 3 minutes pour tout envoyer." },
    { sel: '#howBtn', t: 'Besoin de revoir ça ?', d: 'Chaque page a son tutoriel. Ce bouton le relance quand vous voulez.' },
  ],
  opportunites: [
    { sel: '[data-nav="opportunites"]', side: true, t: "L'onglet Opportunités", d: 'Le cœur de BeautyRevenue : la liste de ce que votre fichier client peut vous rapporter, calculée à partir de votre dernier import.' },
    { sel: '#secHead', t: 'Comment ça fonctionne', d: "Chaque en-tête de page explique à quoi sert la section et comment s'en servir en trois étapes." },
    { sel: '#oppChips', t: 'Filtrer par levier', d: 'Reconquête, cure, produits, vente complémentaire, parrainage. En formule Essentiel, seule la reconquête est active ; les autres leviers affichent un cadenas.' },
    { sel: '#oppList [data-opp]', t: 'Une opportunité', d: 'Une cliente, une raison, une offre et sa valeur estimée. Cliquez pour ouvrir le composeur de message.' },
    { sel: '#oppPot', t: 'Le potentiel total', d: "La somme de ce que les opportunités affichées peuvent rapporter. Un bon réflexe : tout traiter d'un coup, le jour de l'import." },
  ],
  plan: [
    { sel: '[data-nav="plan"]', side: true, t: 'Plan de revenus', d: 'Là où les opportunités répondent à « quoi faire ce mois-ci », le plan de revenus répond à « quoi faire avec cette cliente sur les 6 prochains mois ».' },
    { sel: '#planKpis, #planUpsell', t: 'Le potentiel de votre fichier', d: 'Le CA bonus estimé si chaque plan est suivi, et les clientes à relancer en priorité.' },
    { sel: '#planTable', t: 'Un plan par cliente', d: 'Classées par potentiel. Pour chacune : sa situation, la prochaine action recommandée et le moment idéal.' },
    { sel: '[data-plan-first]', t: 'Voir le plan détaillé', d: 'Ouvre la fiche cliente avec la séquence complète : relance, cure, routine produits, vente complémentaire, parrainage.' },
  ],
  clientes: [
    { sel: '[data-nav="clientes"]', side: true, t: "L'espace Clientes", d: 'Toute votre base : coordonnées, historique, prestation favorite, produits achetés.' },
    { sel: '#clientTabs', t: 'Des vues qui servent à agir', d: '« En retard de visite » : les plus faciles à récupérer. « Très fidèles » : vos futures ambassadrices. « Coordonnées manquantes » : 2 minutes pour débloquer des relances.' },
    { sel: '#clientSearch', t: 'Rechercher', d: 'Par nom ou par prestation. La liste se filtre instantanément.' },
    { sel: '#clientTable [data-client]', t: 'La fiche cliente', d: 'Cliquez sur une ligne : vous pouvez corriger un téléphone ou un e-mail, consulter son plan de revenus et lui écrire directement.' },
    { sel: '#importBtn', t: 'Importer ou mettre à jour', d: 'Votre export mensuel se dépose ici aussi : les clientes existantes sont mises à jour, les nouvelles ajoutées.' },
  ],
  envois: [
    { sel: '[data-nav="envois"]', side: true, t: 'Envois & messages', d: 'Tout ce qui part vers vos clientes : historique, modèles et canaux.' },
    { sel: '#envTabs', t: 'Trois onglets', d: 'Historique des envois, modèles de messages, canaux et lien de réservation.' },
    { sel: '#envTabs [data-etab="modeles"]', t: 'Vos modèles', d: 'Un SMS et un e-mail par levier. En Croissance, vous les adaptez à votre ton ; en Essentiel, le modèle de reconquête est fixe.' },
    { sel: '#envTabs [data-etab="canaux"]', t: 'Le lien de réservation', d: "Collez l'adresse de votre page Planity (ou autre). Chaque message l'inclut." },
    { sel: '#envTable, #tplGrid, #chanForm', t: 'Rien ne part sans vous', d: "BeautyRevenue prépare le message et l'ouvre dans votre application SMS, WhatsApp ou votre messagerie. Vous appuyez sur Envoyer, puis vous marquez la conversion quand la cliente revient." },
  ],
  performance: [
    { sel: '[data-nav="performance"]', side: true, t: 'Performance', d: "La page pour votre comptable, votre banque… et vous : ce que vos 5 minutes mensuelles ont rapporté par rapport au coût de l'abonnement." },
    { sel: '#perfKpis', t: 'Attribution stricte', d: "Seules les ventes consécutives à un message envoyé d'ici sont comptées. Pas de « CA influencé »." },
    { sel: '#perfCharts', t: 'Mois après mois', d: "L'évolution du CA bonus et sa répartition par levier." },
    { sel: '#exportBtn', t: 'Exporter', d: 'Un CSV propre à transmettre ou à archiver (formule Croissance).' },
  ],
  parametres: [
    { sel: '[data-nav="parametres"]', side: true, t: 'Paramètres', d: 'Votre institut, votre formule, votre base de données client et vos rappels.' },
    { sel: '#setImport', t: 'Base de données client', d: "La date de votre dernier import et le rappel mensuel. En Croissance, une adresse e-mail dédiée permet d'importer sans ouvrir BeautyRevenue." },
    { sel: '#setPlan', t: 'Votre formule', d: 'Essentiel fait revenir les clientes perdues. Croissance ajoute cures, produits, ventes complémentaires, parrainage et plan de revenus. Changez quand vous voulez.' },
    { sel: '#settingsForm', t: 'Mon institut', d: "Le nom de l'institut apparaît dans chaque SMS et e-mail." },
    { sel: '#setSec', t: 'Sécurité & démo', d: 'Changer le mot de passe, remettre les données de démonstration à zéro ou rejouer tous les tutoriels.' },
  ],
}
