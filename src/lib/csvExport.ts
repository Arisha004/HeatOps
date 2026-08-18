import { RiskAnalysisResult } from '../types';

export interface GenerateCsvOptions {
  analysis: RiskAnalysisResult;
  userName?: string;
  userRole?: string;
  organization?: string;
}

/**
 * Escapes fields for RFC 4180 CSV compliance
 */
function escapeCsvField(field: string | number | null | undefined): string {
  if (field === null || field === undefined) return '""';
  const stringified = String(field);
  if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n') || stringified.includes('\r')) {
    return `"${stringified.replace(/"/g, '""')}"`;
  }
  return stringified;
}

/**
 * Generates and triggers download of a structured CSV file for enterprise safety reporting
 */
export function exportAnalysisToCsv(options: GenerateCsvOptions) {
  const { analysis, userName, userRole, organization } = options;

  const lines: string[] = [];

  // 1. Title & Metadata Header
  lines.push('HEATOPS — ISO 7243:2017 OCCUPATIONAL HEAT SAFETY DATA EXPORT');
  lines.push(`Generated At,${escapeCsvField(new Date().toISOString())}`);
  lines.push(`Site Name,${escapeCsvField(analysis.siteName)}`);
  lines.push(`Location,${escapeCsvField(analysis.location)}`);
  lines.push(`Activity / Trade,${escapeCsvField(analysis.activityType)}`);
  lines.push(`Scheduled Working Hours,${escapeCsvField(analysis.plannedHours)}`);
  lines.push(`Decision Status,${escapeCsvField(analysis.decisionStatus)}`);
  lines.push(`Safety Threshold Limit (°C),${escapeCsvField(analysis.thresholdTemp)}`);
  lines.push(`Peak Forecast Ambient Temp (°C),${escapeCsvField(Math.max(...(analysis.hourlyRisks || []).map((h) => h.tempC), analysis.currentTemp))}`);
  lines.push(`Peak Heat Index / WBGT (°C),${escapeCsvField(Math.max(...(analysis.hourlyRisks || []).map((h) => h.heatIndexC), analysis.currentHeatIndex))}`);
  lines.push(`Recommended Pause Window,${escapeCsvField(analysis.recommendedPauseWindow)}`);
  lines.push(`Hydration Schedule,${escapeCsvField(analysis.hydratedBreaksFrequency)}`);
  if (userName) lines.push(`Assessor Name,${escapeCsvField(userName)}`);
  if (userRole) lines.push(`Assessor Role,${escapeCsvField(userRole)}`);
  if (organization) lines.push(`Organization,${escapeCsvField(organization)}`);
  lines.push(`Compliance Standard,ISO 7243:2017 / OSHA Heat Stress Framework`);
  lines.push(''); // Blank separator

  // 2. Executive Decision & Reasoning
  lines.push('EXECUTIVE SAFETY SUMMARY');
  lines.push(`Overall Safety Verdict,${escapeCsvField(analysis.overallVerdict)}`);
  lines.push(`Primary Risk Trigger,${escapeCsvField(analysis.goNoGoReason)}`);
  if (analysis.aiReasoning && analysis.aiReasoning.length > 0) {
    analysis.aiReasoning.forEach((reason, index) => {
      lines.push(`HSE Compliance Note ${index + 1},${escapeCsvField(reason)}`);
    });
  }
  lines.push(''); // Blank separator

  // 3. Hourly Meteorological & Thermal Stress Log
  lines.push('HOURLY METEOROLOGICAL & THERMAL STRESS DATA TABLE');
  const tableHeaders = [
    'Hour (24h)',
    'Hour Label',
    'Ambient Temp (°C)',
    'Heat Index / WBGT (°C)',
    'Relative Humidity (%)',
    'UV Index',
    'Risk Level',
    'Forecast Confidence',
    'Mandatory Protocol & Recommendation',
  ];
  lines.push(tableHeaders.join(','));

  if (analysis.hourlyRisks && analysis.hourlyRisks.length > 0) {
    analysis.hourlyRisks.forEach((hr) => {
      const row = [
        escapeCsvField(hr.hour),
        escapeCsvField(hr.hourLabel),
        escapeCsvField(hr.tempC),
        escapeCsvField(hr.heatIndexC),
        escapeCsvField(hr.humidity),
        escapeCsvField(hr.uvIndex),
        escapeCsvField(hr.riskLevel.toUpperCase()),
        escapeCsvField(hr.confidence.toUpperCase()),
        escapeCsvField(hr.recommendation),
      ];
      lines.push(row.join(','));
    });
  }

  // Add UTF-8 Byte Order Mark (\uFEFF) for immediate native Microsoft Excel / PowerBI character recognition
  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const siteSlug = analysis.siteName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `heatops-safety-data-${siteSlug}-${dateStr}.csv`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
