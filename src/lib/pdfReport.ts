import { jsPDF } from 'jspdf';
import { RiskAnalysisResult } from '../types';

export interface GeneratePdfOptions {
  analysis: RiskAnalysisResult;
  userName?: string;
  userRole?: string;
  organization?: string;
  language?: 'en' | 'hi';
}

export function generateHeatRiskPdfReport(options: GeneratePdfOptions) {
  const { analysis, userName, userRole, organization } = options;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  // Professional Corporate Color Palette
  const colorNavy = [15, 23, 42]; // #0F172A
  const colorDark = [30, 41, 59]; // #1E293B
  const colorMuted = [100, 116, 139]; // #64748B
  const colorOrange = [234, 88, 12]; // #EA580C
  const colorBgLight = [248, 250, 252]; // #F8FAFC
  const colorBorder = [226, 232, 240]; // #E2E8F0
  const colorWhite = [255, 255, 255];

  let statusColor = [16, 185, 129]; // Emerald (GO)
  let statusBg = [236, 253, 245];
  if (analysis.decisionStatus === 'NO-GO') {
    statusColor = [220, 38, 38]; // Red
    statusBg = [254, 242, 242];
  } else if (analysis.decisionStatus === 'CAUTION') {
    statusColor = [217, 119, 6]; // Amber
    statusBg = [255, 251, 235];
  }

  let y = 14;

  // Vertical space reserved at the bottom of every page for the footer note.
  const footerReserve = 12;
  // Lowest y a section may occupy before it must flow onto a new page.
  const maxY = pageHeight - footerReserve;

  // Starts a new page when `needed` mm will not fit above the footer.
  // Returns true if a page break happened, so callers can re-draw table headers.
  const ensureSpace = (needed: number): boolean => {
    if (y + needed <= maxY) return false;
    doc.addPage();
    y = 14;
    return true;
  };

  // ==========================================
  // 1. HEADER SECTION (No text collisions)
  // ==========================================
  const headerHeight = 26;
  doc.setFillColor(colorNavy[0], colorNavy[1], colorNavy[2]);
  doc.roundedRect(margin, y, contentWidth, headerHeight, 2, 2, 'F');

  // Left Title Block
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('HeatOps', margin + 7, y + 10);

  // Subtitle / Standard Tag
  doc.setFillColor(colorOrange[0], colorOrange[1], colorOrange[2]);
  doc.roundedRect(margin + 36, y + 5.5, 54, 6, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('ISO 7243:2017 OCCUPATIONAL REPORT', margin + 38, y + 9.8);

  doc.setTextColor(203, 213, 225);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Site Thermal Microclimate & Occupational Hazard Assessment', margin + 7, y + 19);

  // Right Metadata Block (Fixed right bounds)
  const rightAlignX = margin + contentWidth - 7;
  doc.setTextColor(254, 215, 170); // Light amber text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('HSE SAFETY COMPLIANCE AUDIT', rightAlignX, y + 10, { align: 'right' });

  doc.setTextColor(203, 213, 225);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  const dateFormatted = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Generated: ${dateFormatted}`, rightAlignX, y + 18, { align: 'right' });

  y += headerHeight + 5; // y is now 45

  // ==========================================
  // 2. SITE & OPERATION METADATA CARD
  // ==========================================
  const infoCardHeight = 22;
  doc.setFillColor(colorBgLight[0], colorBgLight[1], colorBgLight[2]);
  doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
  doc.roundedRect(margin, y, contentWidth, infoCardHeight, 2, 2, 'FD');

  const col1X = margin + 6;
  const col2X = margin + 58;
  const col3X = margin + 112;
  const col4X = margin + 150;

  // Labels
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2]);
  doc.text('PROJECT / SITE', col1X, y + 5.5);
  doc.text('LOCATION / METEOROLOGY', col2X, y + 5.5);
  doc.text('ACTIVITY / TRADE', col3X, y + 5.5);
  doc.text('SCHEDULED SHIFT', col4X, y + 5.5);

  // Values
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  const siteStr = doc.splitTextToSize(analysis.siteName, 48)[0] || analysis.siteName;
  const locStr = doc.splitTextToSize(analysis.location, 50)[0] || analysis.location;
  doc.text(siteStr, col1X, y + 11.5);
  doc.setFont('helvetica', 'normal');
  doc.text(locStr, col2X, y + 11.5);
  doc.text(analysis.activityType, col3X, y + 11.5);
  doc.text(analysis.plannedHours || 'Full Day', col4X, y + 11.5);

  // Sub-row (Auditor details)
  doc.setFontSize(7);
  doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2]);
  const leadInfo = userName
    ? `Assessor: ${userName} (${userRole || 'Site Supervisor'}) • Org: ${organization || 'Contractor'} • Ref: ${analysis.id}`
    : `Assessment ID: ${analysis.id} • Regulatory Protocol: ISO 7243:2017 & OSHA Heat Stress Framework`;
  doc.text(leadInfo, col1X, y + 17.5);

  y += infoCardHeight + 5; // y is now 72

  // ==========================================
  // 3. EXECUTIVE SAFETY VERDICT BANNER
  // ==========================================
  // Measure the wrapped text FIRST so the card can be sized to fit it.
  // Previously the card was a fixed 28mm and only line [0] of each block was
  // drawn, which silently cut the verdict and trigger off mid-sentence.
  const verdictLineHeight = 4.6;   // for 10.5pt bold
  const reasonLineHeight = 3.6;    // for 8pt normal
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  const verdictLines: string[] = doc.splitTextToSize(
    analysis.overallVerdict || '',
    contentWidth - 16
  );
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const reasonLines: string[] = doc.splitTextToSize(
    `Trigger: ${analysis.goNoGoReason || ''}`,
    contentWidth - 16
  );

  const verdictTop = 12;           // first verdict baseline, below the status badge
  const verdictBlock = verdictLines.length * verdictLineHeight;
  const reasonBlock = reasonLines.length * reasonLineHeight;
  const pauseBlock = 7.5;          // pause/hydration callout + bottom padding
  const verdictCardHeight = Math.max(28, verdictTop + verdictBlock + 2 + reasonBlock + pauseBlock);

  ensureSpace(verdictCardHeight + 5);
  doc.setFillColor(statusBg[0], statusBg[1], statusBg[2]);
  doc.setDrawColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentWidth, verdictCardHeight, 2, 2, 'FD');
  doc.setLineWidth(0.2); // reset line width

  // Accent bar on left
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(margin, y, 4.5, verdictCardHeight, 1.5, 1.5, 'F');

  // Status Badge
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(`OCCUPATIONAL SAFETY VERDICT: ${analysis.decisionStatus} STATUS`, margin + 9, y + 6.5);

  // Big Verdict Headline - every wrapped line is drawn, not just the first.
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  let vy = y + verdictTop;
  verdictLines.forEach((line) => {
    doc.text(line, margin + 9, vy);
    vy += verdictLineHeight;
  });

  // Reason / Risk explanation - full wrapped text.
  vy += 2;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  reasonLines.forEach((line) => {
    doc.text(line, margin + 9, vy);
    vy += reasonLineHeight;
  });

  // Pause & Hydration schedule callout, pinned to the bottom of the card
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colorOrange[0], colorOrange[1], colorOrange[2]);
  doc.text(`Recommended Pause: ${analysis.recommendedPauseWindow}   |   Hydration: ${analysis.hydratedBreaksFrequency}`, margin + 9, y + verdictCardHeight - 3.5);

  y += verdictCardHeight + 5; // y is now 105

  // ==========================================
  // 4. LIVE METEOROLOGICAL TELEMETRY (5 Equal Metrics)
  // ==========================================
  const gap = 2.5;
  const numBoxes = 5;
  const boxWidth = (contentWidth - gap * (numBoxes - 1)) / numBoxes;
  const boxHeight = 18;

  const telemetryMetrics = [
    { label: 'AIR TEMP', val: `${analysis.currentTemp}°C`, sub: 'Ambient Dry Bulb' },
    { label: 'WBGT INDEX', val: `${analysis.currentHeatIndex}°C`, sub: 'Wet-Bulb Globe' },
    { label: 'REL. HUMIDITY', val: `${analysis.currentHumidity}%`, sub: 'Vapor Saturation' },
    { label: 'UV RADIATION', val: `${analysis.currentUvIndex} / 12`, sub: 'Solar Radiation' },
    { label: 'WIND SPEED', val: `${analysis.currentWindSpeed} km/h`, sub: 'Convective Flow' },
  ];

  telemetryMetrics.forEach((m, idx) => {
    const bx = margin + idx * (boxWidth + gap);
    doc.setFillColor(colorWhite[0], colorWhite[1], colorWhite[2]);
    doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
    doc.roundedRect(bx, y, boxWidth, boxHeight, 1.5, 1.5, 'FD');

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2]);
    doc.text(m.label, bx + 3.5, y + 5);

    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
    doc.text(m.val, bx + 3.5, y + 11.5);

    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2]);
    doc.text(m.sub, bx + 3.5, y + 15.5);
  });

  y += boxHeight + 6; // y is now 129

  // ==========================================
  // 5. HOURLY EXPOSURE TABLE (ISO 7243 SCHEDULE)
  // ==========================================
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  doc.text('HOURLY THERMAL EXPOSURE SCHEDULE & WORK-REST CYCLES (ISO 7243)', margin, y + 1);

  y += 4;

  // Table Header
  const tableHeaderHeight = 6.5;
  const tColTime = margin + 4;
  const tColAir = margin + 22;
  const tColWbgt = margin + 44;
  const tColRisk = margin + 68;
  const tColHum = margin + 94;
  const tColUv = margin + 116;
  const tColAction = margin + 136;

  // Drawn once here, and again at the top of each continuation page so a
  // multi-page schedule stays readable.
  const drawTableHeader = () => {
    doc.setFillColor(colorNavy[0], colorNavy[1], colorNavy[2]);
    doc.roundedRect(margin, y, contentWidth, tableHeaderHeight, 1, 1, 'F');
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('TIME', tColTime, y + 4.5);
    doc.text('AIR TEMP', tColAir, y + 4.5);
    doc.text('WBGT / INDEX', tColWbgt, y + 4.5);
    doc.text('RISK LEVEL', tColRisk, y + 4.5);
    doc.text('HUMIDITY', tColHum, y + 4.5);
    doc.text('UV INDEX', tColUv, y + 4.5);
    doc.text('SAFETY ACTION & WORK-REST DIRECTIVE', tColAction, y + 4.5);
    y += tableHeaderHeight;
  };

  const rowHeight = 5.8;
  ensureSpace(tableHeaderHeight + rowHeight * 2);
  drawTableHeader();

  // Render EVERY hour returned by the engine. This was previously
  // .slice(0, 10), which silently dropped the 4 PM / 5 PM / 6 PM rows from a
  // standard 6 AM-6 PM (13 hour) shift - the hottest part of the afternoon.
  const rows = analysis.hourlyRisks || [];

  rows.forEach((row, i) => {
    if (ensureSpace(rowHeight)) drawTableHeader();
    const isEven = i % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, y, contentWidth, rowHeight, 'F');

    doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);

    doc.text(row.hourLabel || row.hour, tColTime, y + 4);
    doc.text(`${row.tempC}°C`, tColAir, y + 4);
    doc.text(`${row.heatIndexC}°C`, tColWbgt, y + 4);

    // Color code risk level
    const upperRisk = row.riskLevel.toUpperCase();
    if (row.riskLevel === 'extreme') {
      doc.setTextColor(220, 38, 38);
      doc.setFont('helvetica', 'bold');
    } else if (row.riskLevel === 'high') {
      doc.setTextColor(234, 88, 12);
      doc.setFont('helvetica', 'bold');
    } else if (row.riskLevel === 'caution') {
      doc.setTextColor(202, 138, 4);
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setTextColor(16, 185, 129);
      doc.setFont('helvetica', 'bold');
    }
    doc.text(upperRisk, tColRisk, y + 4);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
    doc.text(`${row.humidity}%`, tColHum, y + 4);
    doc.text(`${row.uvIndex} / 12`, tColUv, y + 4);

    const directiveText = doc.splitTextToSize(row.recommendation, 43)[0] || row.recommendation;
    doc.text(directiveText, tColAction, y + 4);

    y += rowHeight;
  });

  y += 4.5; // y is now ~202

  // ==========================================
  // 6. ACTIONABLE CONTROLS & AI REASONING
  // ==========================================
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  doc.text('MANDATORY HSE ENGINEERING CONTROLS & REASONING', margin, y + 1);

  y += 4;

  const actionBoxHeight = 23;
  ensureSpace(actionBoxHeight + 5);
  doc.setFillColor(colorBgLight[0], colorBgLight[1], colorBgLight[2]);
  doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
  doc.roundedRect(margin, y, contentWidth, actionBoxHeight, 1.5, 1.5, 'FD');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);

  const controlPoints = [
    '• Hydration & Electrolytes: Provide potable water (<18°C) within 50m of work zones with ORS electrolyte replenishment.',
    '• Active Shaded Shelters: Install UV-blocking shaded rest shelters with misting fans for mandatory work-rest cycles.',
    '• Physiological Buddy System: Assign 2-person buddy pairs to continuously monitor signs of heat exhaustion and dizziness.',
  ];

  controlPoints.forEach((pt, idx) => {
    doc.text(pt, margin + 5, y + 6 + idx * 5.2);
  });

  y += actionBoxHeight + 5; // y is now ~234

  // ==========================================
  // 7. VERIFICATION & SIGN-OFF AUDIT BLOCK
  // ==========================================
  const signoffHeight = 22;
  ensureSpace(signoffHeight);
  doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
  doc.roundedRect(margin, y, contentWidth, signoffHeight, 1.5, 1.5, 'D');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2]);
  doc.text('SITE HSE MANAGER SIGN-OFF & COMPLIANCE ACKNOWLEDGEMENT', margin + 5, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('I confirm that occupational heat stress mitigations and work-rest schedules have been verified and communicated to site crews.', margin + 5, y + 9.5);

  // Signature lines
  const sig1X = margin + 5;
  const sig2X = margin + 65;
  const sig3X = margin + 120;

  doc.setDrawColor(180, 190, 205);
  doc.line(sig1X, y + 16, sig1X + 48, y + 16);
  doc.text('Supervisor / Foreperson Signature', sig1X, y + 19.5);

  doc.line(sig2X, y + 16, sig2X + 42, y + 16);
  doc.text('Date & Time of Implementation', sig2X, y + 19.5);

  doc.line(sig3X, y + 16, margin + contentWidth - 5, y + 16);
  doc.text('Safety Officer ID / Badge Number', sig3X, y + 19.5);

  // ==========================================
  // 8. FOOTER NOTE (Bottom of Page)
  // ==========================================
  // Drawn on EVERY page - the report can now span more than one page.
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2]);
    doc.text(
      'HeatOps Enterprise Safety Engine • ISO 7243:2017 & OSHA 3154 Compliant • Validated against Live High-Resolution Meteorological Telemetry',
      pageWidth / 2,
      pageHeight - 7,
      { align: 'center' }
    );
    if (totalPages > 1) {
      doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
    }
  }

  // Trigger download
  const sanitizedSite = analysis.siteName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `HeatOps_Safety_Report_${sanitizedSite}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

