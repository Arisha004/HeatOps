import { ActivityType, PredefinedSitePreset, RiskLevel } from './types';

export const POPULAR_US_LOCATIONS = [
  "Downtown Phoenix, Arizona",
  "Sky Harbor Logistics Corridor, Phoenix, Arizona",
  "Tucson Aerospace Industrial Park, Arizona",
  "Las Vegas Strip Expansion Corridor, Nevada",
  "Houston Ship Channel Industrial District, Texas",
  "Dallas Trinity Groves Redevelopment, Texas",
  "Austin Domain Expansion, Texas",
  "San Antonio Port Logistics Park, Texas",
  "Miami Brickell Waterfront District, Florida",
  "Tampa Port Redevelopment Zone, Florida",
  "Atlanta Beltline Corridor, Georgia",
  "Sacramento Railyards Redevelopment, California",
];

export const ACTIVITY_TYPES: ActivityType[] = [
  'Excavation & Earthwork',
  'Concrete Pouring',
  'Material Loading/Unloading',
  'Roofing & Structural Steel',
  'Asphalt Paving',
  'General Masonry & Scaffolding',
];

export const PRESET_SITES: PredefinedSitePreset[] = [
  {
    siteName: "Sky Harbor Logistics Hub — Slab 1",
    location: "Sky Harbor Logistics Corridor, Phoenix, Arizona",
    activityType: "Concrete Pouring",
    startTime: "06:00",
    endTime: "18:00",
    thresholdTemp: 34,
    headcount: 30,
    acclimatized: true,
    shadeAvailable: false,
    waterAvailable: true,
    description: "Dense urban heat island with +4.5°C thermal delta over the metro average. Heavy concrete slab pour."
  },
  {
    siteName: "Brickell Commercial Tower 4",
    location: "Miami Brickell Waterfront District, Florida",
    activityType: "Roofing & Structural Steel",
    startTime: "07:00",
    endTime: "17:00",
    thresholdTemp: 34,
    headcount: 45,
    acclimatized: false,
    shadeAvailable: false,
    waterAvailable: true,
    description: "Glass facade and structural steel reflection causing extreme midday wet-bulb radiative load."
  },
  {
    siteName: "Trinity Groves Transit Extension",
    location: "Dallas Trinity Groves Redevelopment, Texas",
    activityType: "Concrete Pouring",
    startTime: "06:00",
    endTime: "18:00",
    thresholdTemp: 35,
    headcount: 50,
    acclimatized: true,
    shadeAvailable: false,
    waterAvailable: true,
    description: "Suburban Texas infrastructure corridor with heavy concrete hydration and solar zenith flux."
  },
  {
    siteName: "Ship Channel Freight Terminal",
    location: "Houston Ship Channel Industrial District, Texas",
    activityType: "Material Loading/Unloading",
    startTime: "06:00",
    endTime: "16:00",
    thresholdTemp: 35,
    headcount: 25,
    acclimatized: true,
    shadeAvailable: true,
    waterAvailable: true,
    description: "Gulf Coast humidity combined with asphalt thermal emission in a semi-enclosed freight loading bay."
  },
  {
    siteName: "I-11 Highway Flyover Alignment",
    location: "Las Vegas Strip Expansion Corridor, Nevada",
    activityType: "Asphalt Paving",
    startTime: "06:00",
    endTime: "17:00",
    thresholdTemp: 36,
    headcount: 35,
    acclimatized: true,
    shadeAvailable: false,
    waterAvailable: true,
    description: "Extreme dry heat with +4.2°C bitumen heat emission during high-temperature asphalt compaction."
  },
];

export interface RiskColorToken {
  level: RiskLevel;
  label: string;
  fgHex: string;
  bgHex: string;
  borderHex: string;
  fillHex: string;
  tailwindBg: string;
  tailwindFg: string;
  tailwindBorder: string;
  tailwindFill: string;
  badgeClass: string;
}

export const RISK_COLOR_TOKENS: Record<RiskLevel, RiskColorToken> = {
  safe: {
    level: 'safe',
    label: 'Safe',
    fgHex: '#065F46',
    bgHex: '#ECFDF5',
    borderHex: '#A7F3D0',
    fillHex: '#10B981',
    tailwindBg: 'bg-emerald-50',
    tailwindFg: 'text-emerald-800',
    tailwindBorder: 'border-emerald-200',
    tailwindFill: 'bg-emerald-500',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  caution: {
    level: 'caution',
    label: 'Caution',
    fgHex: '#92400E',
    bgHex: '#FFFBEB',
    borderHex: '#FDE68A',
    fillHex: '#F59E0B',
    tailwindBg: 'bg-amber-50',
    tailwindFg: 'text-amber-800',
    tailwindBorder: 'border-amber-200',
    tailwindFill: 'bg-amber-500',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  high: {
    level: 'high',
    label: 'High Risk',
    fgHex: '#9A3412',
    bgHex: '#FFF7ED',
    borderHex: '#FED7AA',
    fillHex: '#F97316',
    tailwindBg: 'bg-orange-50',
    tailwindFg: 'text-orange-900',
    tailwindBorder: 'border-orange-200',
    tailwindFill: 'bg-orange-500',
    badgeClass: 'bg-orange-50 text-orange-900 border-orange-200',
  },
  extreme: {
    level: 'extreme',
    label: 'Extreme',
    fgHex: '#991B1B',
    bgHex: '#FEF2F2',
    borderHex: '#FECACA',
    fillHex: '#EF4444',
    tailwindBg: 'bg-red-50',
    tailwindFg: 'text-red-900',
    tailwindBorder: 'border-red-200',
    tailwindFill: 'bg-red-600',
    badgeClass: 'bg-red-50 text-red-900 border-red-200',
  },
  unknown: {
    level: 'unknown',
    label: 'Unknown / Stale',
    fgHex: '#374151',
    bgHex: '#F3F4F6',
    borderHex: '#E5E7EB',
    fillHex: '#9CA3AF',
    tailwindBg: 'bg-neutral-100',
    tailwindFg: 'text-neutral-700',
    tailwindBorder: 'border-neutral-200',
    tailwindFill: 'bg-neutral-400',
    badgeClass: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  },
};
