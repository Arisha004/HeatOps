import { ActivityType, PredefinedSitePreset, RiskLevel } from './types';

export const POPULAR_INDIAN_LOCATIONS = [
  "Noida Sector 62, Uttar Pradesh",
  "Gurgaon Cyber City, Haryana",
  "Jaipur Sitapura Industrial Area, Rajasthan",
  "Lucknow Gomti Nagar Extension, Uttar Pradesh",
  "Kanpur Panki Industrial Estate, Uttar Pradesh",
  "Ahmedabad GIDC Naroda, Gujarat",
  "Varanasi Bypass Alignment, Uttar Pradesh",
  "Chandigarh IT Park, Punjab",
  "Delhi Dwarka Expressway Sector 110",
  "Mumbai JNPT Port Terminal, Maharashtra",
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
    siteName: "Noida Sec-62 Metro Extension",
    location: "Noida Sector 62, Uttar Pradesh",
    activityType: "Concrete Pouring",
    startTime: "06:00",
    endTime: "18:00",
    thresholdTemp: 35,
  },
  {
    siteName: "Jaipur Highway Flyover Alignment",
    location: "Jaipur Sitapura Industrial Area, Rajasthan",
    activityType: "Asphalt Paving",
    startTime: "06:00",
    endTime: "17:00",
    thresholdTemp: 36,
  },
  {
    siteName: "Gurgaon Commercial Tower B",
    location: "Gurgaon Cyber City, Haryana",
    activityType: "Roofing & Structural Steel",
    startTime: "07:00",
    endTime: "16:00",
    thresholdTemp: 34,
  },
  {
    siteName: "Lucknow Logistics Warehouse",
    location: "Lucknow Gomti Nagar Extension, Uttar Pradesh",
    activityType: "Material Loading/Unloading",
    startTime: "06:00",
    endTime: "18:00",
    thresholdTemp: 35,
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
