export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  country: string;
  countryName: string;
  countryFlag: string;
  location: string;
  salary_amount: number;
  salary_currency: string;
  salary_label: string;
  contract_type: string;
  status: 'draft' | 'open' | 'closed';
}

export const jobs: Job[] = [
  {
    id: 'setter-essr-mg',
    title: 'Setter — Formation Secrétaire Médicale',
    description:
      "Appeler les leads Meta Ads et booker des rendez-vous téléphoniques avec notre conseillère formation pour la Formation Secrétaire Médicale ESSR. Volume : 50 leads/jour, objectif 8-12 RDV/jour.",
    requirements: [
      'Français fluide avec accent compréhensible',
      'Voix agréable et ton chaleureux',
      'Écoute active et capacité de reformulation',
      'Résilience face au rejet',
      'PC/Mac avec casque micro et connexion internet stable (min 10 Mbps)',
      'Disponible lundi-vendredi, 9h-18h CET',
    ],
    country: 'MG',
    countryName: 'Madagascar',
    countryFlag: '🇲🇬',
    location: 'Télétravail',
    salary_amount: 2500000,
    salary_currency: 'MGA',
    salary_label: '2.5M Ariary/mois',
    contract_type: 'Freelance',
    status: 'open',
  },
  {
    id: 'setter-essr-ma',
    title: 'Setter — Formation Secrétaire Médicale',
    description:
      "Appeler les leads Meta Ads et booker des rendez-vous téléphoniques avec notre conseillère formation pour la Formation Secrétaire Médicale ESSR. Volume : 50 leads/jour, objectif 8-12 RDV/jour.",
    requirements: [
      'Français fluide avec accent compréhensible',
      'Voix agréable et ton chaleureux',
      'Écoute active et capacité de reformulation',
      'Résilience face au rejet',
      'PC/Mac avec casque micro et connexion internet stable (min 10 Mbps)',
      'Disponible lundi-vendredi, 9h-18h CET',
    ],
    country: 'MA',
    countryName: 'Maroc',
    countryFlag: '🇲🇦',
    location: 'Télétravail',
    salary_amount: 6000,
    salary_currency: 'MAD',
    salary_label: '6 000 DH/mois',
    contract_type: 'Freelance',
    status: 'open',
  },
];
