import { ActivityType, PredefinedSitePreset, RiskLevel } from './types';

export const POPULAR_INDIAN_LOCATIONS = [
  "Dharavi, Mumbai, Maharashtra",
  "Bandra Kurla Complex (BKC), Mumbai, Maharashtra",
  "Navi Mumbai Vashi, Maharashtra",
  "Noida Sector 62, Uttar Pradesh",
  "Gurgaon Cyber City, Haryana",
  "Jaipur Sitapura Industrial Area, Rajasthan",
  "Lucknow Gomti Nagar Extension, Uttar Pradesh",
  "Kanpur Panki Industrial Estate, Uttar Pradesh",
  "Ahmedabad GIDC Naroda, Gujarat",
  "Chennai Sriperumbudur Industrial Corridor, Tamil Nadu",
  "Bengaluru Peenya Industrial Area, Karnataka",
  "Delhi Dwarka Expressway Sector 110",
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
    siteName: "Dharavi Redevelopment Sector 1",
    location: "Dharavi, Mumbai, Maharashtra",
    activityType: "Concrete Pouring",
    startTime: "06:00",
    endTime: "18:00",
    thresholdTemp: 34,
    headcount: 30,
    acclimatized: true,
    shadeAvailable: false,
    waterAvailable: true,
    description: "High density urban heat island with +4.2°C thermal delta over city average. Heavy concrete slab pour."
  },
  {
    siteName: "BKC Commercial Tower 4",
    location: "Bandra Kurla Complex (BKC), Mumbai, Maharashtra",
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
    siteName: "Noida Sec-62 Metro Extension",
    location: "Noida Sector 62, Uttar Pradesh",
    activityType: "Concrete Pouring",
    startTime: "06:00",
    endTime: "18:00",
    thresholdTemp: 35,
    headcount: 50,
    acclimatized: true,
    shadeAvailable: false,
    waterAvailable: true,
    description: "Suburban Delhi NCR infrastructure corridor with heavy concrete hydration and solar zenith flux."
  },
  {
    siteName: "Navi Mumbai Vashi Logistics Terminal",
    location: "Navi Mumbai Vashi, Maharashtra",
    activityType: "Material Loading/Unloading",
    startTime: "06:00",
    endTime: "16:00",
    thresholdTemp: 35,
    headcount: 25,
    acclimatized: true,
    shadeAvailable: true,
    waterAvailable: true,
    description: "Coastal humidity combined with asphalt thermal emission in semi-enclosed freight loading bay."
  },
  {
    siteName: "Jaipur Highway Flyover Alignment",
    location: "Jaipur Sitapura Industrial Area, Rajasthan",
    activityType: "Asphalt Paving",
    startTime: "06:00",
    endTime: "17:00",
    thresholdTemp: 36,
    headcount: 35,
    acclimatized: true,
    shadeAvailable: false,
    waterAvailable: true,
    description: "Extreme dry heat with +4.5°C bitumen heat emission during high-temperature asphalt compaction."
  },
];

export interface RiskColorToken {
  level: RiskLevel;
  label: string;
  labelHi: string;
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
    labelHi: 'सुरक्षित',
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
    labelHi: 'सावधानी',
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
    labelHi: 'उच्च जोखिम',
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
    labelHi: 'अत्यधिक जोखिम',
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
    labelHi: 'अज्ञात',
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
