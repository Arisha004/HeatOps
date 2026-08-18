export type RiskLevel = 'safe' | 'caution' | 'high' | 'extreme' | 'unknown';

export type ActivityType = 
  | 'Excavation & Earthwork'
  | 'Concrete Pouring'
  | 'Material Loading/Unloading'
  | 'Roofing & Structural Steel'
  | 'Asphalt Paving'
  | 'General Masonry & Scaffolding';

export interface SiteConfig {
  id?: string;
  siteName: string;
  location: string;
  activityType: ActivityType;
  startTime: string; // e.g. "06:00"
  endTime: string;   // e.g. "18:00"
  thresholdTemp: number; // e.g. 35°C
}

export interface HourlyRisk {
  hour: string;        // e.g., "11:00"
  hourLabel: string;   // e.g., "11 AM"
  tempC: number;
  heatIndexC: number;
  humidity: number;    // %
  uvIndex: number;
  riskLevel: RiskLevel;
  recommendation: string;
  confidence: 'high' | 'moderate' | 'low';
  isUnknown?: boolean;
}

export interface RiskAnalysisResult {
  id: string;
  siteName: string;
  location: string;
  activityType: ActivityType;
  plannedHours: string;
  thresholdTemp: number;
  currentTemp: number;
  currentHeatIndex: number;
  currentHumidity: number;
  currentUvIndex: number;
  currentWindSpeed: number;
  overallVerdict: string;
  decisionStatus: 'GO' | 'CAUTION' | 'NO-GO';
  goNoGoReason: string;
  aiReasoning: string[];
  hourlyRisks: HourlyRisk[];
  peakHeatWindow: string;
  recommendedPauseWindow: string;
  hydratedBreaksFrequency: string;
  timestamp: string;
  isPartialData?: boolean;
  isOfflineCached?: boolean;
  dataUnavailableNote?: string;
}

export type AppView = 'landing' | 'empty' | 'setup' | 'dashboard' | 'tokens';

export interface PredefinedSitePreset {
  siteName: string;
  location: string;
  activityType: ActivityType;
  startTime: string;
  endTime: string;
  thresholdTemp: number;
}
