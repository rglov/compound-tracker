const COMPOUND_LIBRARY = [
  // ═══════════════════════════════════════
  // PEPTIDES
  // ═══════════════════════════════════════
  {
    id: 'bpc-157',
    name: 'BPC-157',
    category: 'peptide',
    halfLifeValue: 4,
    halfLifeUnit: 'hours',
    halfLifeHours: 4,
    defaultUnit: 'mcg',
    defaultRoute: 'subcutaneous',
    color: '#00e676'
  },
  {
    id: 'tb-500',
    name: 'TB-500 (Thymosin Beta-4)',
    category: 'peptide',
    halfLifeValue: 2.5,
    halfLifeUnit: 'hours',
    halfLifeHours: 2.5,
    defaultUnit: 'mg',
    defaultRoute: 'subcutaneous',
    color: '#00c853'
  },
  {
    id: 'pt-141',
    name: 'PT-141 (Bremelanotide)',
    category: 'peptide',
    halfLifeValue: 2,
    halfLifeUnit: 'hours',
    halfLifeHours: 2,
    defaultUnit: 'mg',
    defaultRoute: 'subcutaneous',
    color: '#69f0ae'
  },
  {
    id: 'cjc-1295-dac',
    name: 'CJC-1295 DAC',
    category: 'peptide',
    halfLifeValue: 8,
    halfLifeUnit: 'days',
    halfLifeHours: 192,
    defaultUnit: 'mcg',
    defaultRoute: 'subcutaneous',
    color: '#1de9b6'
  },
  {
    id: 'cjc-1295-no-dac',
    name: 'CJC-1295 (no DAC) / Mod GRF 1-29',
    category: 'peptide',
    halfLifeValue: 30,
    halfLifeUnit: 'minutes',
    halfLifeHours: 0.5,
    defaultUnit: 'mcg',
    defaultRoute: 'subcutaneous',
    color: '#a7ffeb'
  },
  {
    id: 'ipamorelin',
    name: 'Ipamorelin',
    category: 'peptide',
    halfLifeValue: 2,
    halfLifeUnit: 'hours',
    halfLifeHours: 2,
    defaultUnit: 'mcg',
    defaultRoute: 'subcutaneous',
    color: '#64ffda'
  },
  {
    id: 'ghrp-6',
    name: 'GHRP-6',
    category: 'peptide',
    halfLifeValue: 20,
    halfLifeUnit: 'minutes',
    halfLifeHours: 0.333,
    defaultUnit: 'mcg',
    defaultRoute: 'subcutaneous',
    color: '#b9f6ca'
  },
  {
    id: 'ghrp-2',
    name: 'GHRP-2',
    category: 'peptide',
    halfLifeValue: 25,
    halfLifeUnit: 'minutes',
    halfLifeHours: 0.417,
    defaultUnit: 'mcg',
    defaultRoute: 'subcutaneous',
    color: '#ccff90'
  },
  {
    id: 'sermorelin',
    name: 'Sermorelin',
    category: 'peptide',
    halfLifeValue: 12,
    halfLifeUnit: 'minutes',
    halfLifeHours: 0.2,
    defaultUnit: 'mcg',
    defaultRoute: 'subcutaneous',
    color: '#f4ff81'
  },

  // ═══════════════════════════════════════
  // AAS (Anabolic-Androgenic Steroids)
  // ═══════════════════════════════════════
  {
    id: 'test-cyp',
    name: 'Testosterone Cypionate',
    category: 'aas',
    halfLifeValue: 8,
    halfLifeUnit: 'days',
    halfLifeHours: 192,
    defaultUnit: 'mg',
    defaultRoute: 'intramuscular',
    color: '#e74c3c'
  },
  {
    id: 'test-e',
    name: 'Testosterone Enanthate',
    category: 'aas',
    halfLifeValue: 7,
    halfLifeUnit: 'days',
    halfLifeHours: 168,
    defaultUnit: 'mg',
    defaultRoute: 'intramuscular',
    color: '#ff5252'
  },
  {
    id: 'test-prop',
    name: 'Testosterone Propionate',
    category: 'aas',
    halfLifeValue: 2,
    halfLifeUnit: 'days',
    halfLifeHours: 48,
    defaultUnit: 'mg',
    defaultRoute: 'intramuscular',
    color: '#ff8a80'
  },
  {
    id: 'test-u',
    name: 'Testosterone Undecanoate',
    category: 'aas',
    halfLifeValue: 21,
    halfLifeUnit: 'days',
    halfLifeHours: 504,
    defaultUnit: 'mg',
    defaultRoute: 'intramuscular',
    color: '#d32f2f'
  },
  {
    id: 'tren-a',
    name: 'Trenbolone Acetate',
    category: 'aas',
    halfLifeValue: 1,
    halfLifeUnit: 'days',
    halfLifeHours: 24,
    defaultUnit: 'mg',
    defaultRoute: 'intramuscular',
    color: '#ff6d00'
  },
  {
    id: 'tren-e',
    name: 'Trenbolone Enanthate',
    category: 'aas',
    halfLifeValue: 5,
    halfLifeUnit: 'days',
    halfLifeHours: 120,
    defaultUnit: 'mg',
    defaultRoute: 'intramuscular',
    color: '#ff9100'
  },
  {
    id: 'deca',
    name: 'Nandrolone Decanoate (Deca)',
    category: 'aas',
    halfLifeValue: 6,
    halfLifeUnit: 'days',
    halfLifeHours: 144,
    defaultUnit: 'mg',
    defaultRoute: 'intramuscular',
    color: '#ffab40'
  },
  {
    id: 'npp',
    name: 'Nandrolone Phenylpropionate (NPP)',
    category: 'aas',
    halfLifeValue: 1.5,
    halfLifeUnit: 'days',
    halfLifeHours: 36,
    defaultUnit: 'mg',
    defaultRoute: 'intramuscular',
    color: '#ffd740'
  },
  {
    id: 'eq',
    name: 'Boldenone Undecylenate (EQ)',
    category: 'aas',
    halfLifeValue: 14,
    halfLifeUnit: 'days',
    halfLifeHours: 336,
    defaultUnit: 'mg',
    defaultRoute: 'intramuscular',
    color: '#ffc400'
  },
  {
    id: 'mast-prop',
    name: 'Masteron Propionate',
    category: 'aas',
    halfLifeValue: 1,
    halfLifeUnit: 'days',
    halfLifeHours: 24,
    defaultUnit: 'mg',
    defaultRoute: 'intramuscular',
    color: '#f06292'
  },
  {
    id: 'mast-e',
    name: 'Masteron Enanthate',
    category: 'aas',
    halfLifeValue: 5,
    halfLifeUnit: 'days',
    halfLifeHours: 120,
    defaultUnit: 'mg',
    defaultRoute: 'intramuscular',
    color: '#ec407a'
  },
  {
    id: 'anavar',
    name: 'Oxandrolone (Anavar)',
    category: 'aas',
    halfLifeValue: 9,
    halfLifeUnit: 'hours',
    halfLifeHours: 9,
    defaultUnit: 'mg',
    defaultRoute: 'oral',
    color: '#ab47bc'
  },
  {
    id: 'winstrol-oral',
    name: 'Stanozolol Oral (Winstrol)',
    category: 'aas',
    halfLifeValue: 9,
    halfLifeUnit: 'hours',
    halfLifeHours: 9,
    defaultUnit: 'mg',
    defaultRoute: 'oral',
    color: '#7e57c2'
  },
  {
    id: 'winstrol-inj',
    name: 'Stanozolol Injectable (Winstrol)',
    category: 'aas',
    halfLifeValue: 24,
    halfLifeUnit: 'hours',
    halfLifeHours: 24,
    defaultUnit: 'mg',
    defaultRoute: 'intramuscular',
    color: '#5c6bc0'
  },
  {
    id: 'dbol',
    name: 'Methandrostenolone (Dianabol)',
    category: 'aas',
    halfLifeValue: 4.5,
    halfLifeUnit: 'hours',
    halfLifeHours: 4.5,
    defaultUnit: 'mg',
    defaultRoute: 'oral',
    color: '#42a5f5'
  },
  {
    id: 'anadrol',
    name: 'Oxymetholone (Anadrol)',
    category: 'aas',
    halfLifeValue: 8,
    halfLifeUnit: 'hours',
    halfLifeHours: 8,
    defaultUnit: 'mg',
    defaultRoute: 'oral',
    color: '#29b6f6'
  },
  {
    id: 'primo-e',
    name: 'Primobolan Enanthate',
    category: 'aas',
    halfLifeValue: 10,
    halfLifeUnit: 'days',
    halfLifeHours: 240,
    defaultUnit: 'mg',
    defaultRoute: 'intramuscular',
    color: '#ce93d8'
  },

  // ═══════════════════════════════════════
  // HGH / Growth Hormone
  // ═══════════════════════════════════════
  {
    id: 'hgh',
    name: 'Human Growth Hormone (HGH)',
    category: 'hgh',
    halfLifeValue: 3.8,
    halfLifeUnit: 'hours',
    halfLifeHours: 3.8,
    defaultUnit: 'IU',
    defaultRoute: 'subcutaneous',
    color: '#ffd54f'
  },
  {
    id: 'mk-677',
    name: 'MK-677 (Ibutamoren)',
    category: 'hgh',
    halfLifeValue: 24,
    halfLifeUnit: 'hours',
    halfLifeHours: 24,
    defaultUnit: 'mg',
    defaultRoute: 'oral',
    color: '#fff176'
  },
  {
    id: 'tesamorelin',
    name: 'Tesamorelin',
    category: 'hgh',
    halfLifeValue: 26,
    halfLifeUnit: 'minutes',
    halfLifeHours: 0.433,
    defaultUnit: 'mg',
    defaultRoute: 'subcutaneous',
    color: '#fff9c4'
  },

  // ═══════════════════════════════════════
  // GLP-1 Agonists
  // ═══════════════════════════════════════
  {
    id: 'semaglutide',
    name: 'Semaglutide',
    category: 'peptide',
    halfLifeValue: 7,
    halfLifeUnit: 'days',
    halfLifeHours: 168,
    defaultUnit: 'mg',
    defaultRoute: 'subcutaneous',
    color: '#26c6da'
  },
  {
    id: 'tirzepatide',
    name: 'Tirzepatide',
    category: 'peptide',
    halfLifeValue: 5,
    halfLifeUnit: 'days',
    halfLifeHours: 120,
    defaultUnit: 'mg',
    defaultRoute: 'subcutaneous',
    color: '#4dd0e1'
  }
];

const CATEGORIES = {
  peptide: { label: 'Peptides', color: '#00e676' },
  aas: { label: 'AAS', color: '#ff5252' },
  hgh: { label: 'HGH', color: '#ffd54f' }
};

function getCompoundById(id) {
  return COMPOUND_LIBRARY.find(c => c.id === id);
}

function getCompoundsByCategory(category) {
  return COMPOUND_LIBRARY.filter(c => c.category === category);
}
