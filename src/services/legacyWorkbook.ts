import * as XLSX from 'xlsx';
import type { ExportData } from './exportService';

export function generateLegacyWorkbook(data: ExportData): void {
  const workbook = XLSX.utils.book_new();
  workbook.Props = {
    Title: 'SEA Market Reference Workbook',
    Subject: `Requested focus: ${data.selectedCountries.join(', ') || 'All markets'}; workbook retains regional reference material`,
    Comments: 'Illustrative static example from src/services/legacyWorkbook.ts; original sources and observation dates unavailable.'
  };

  // Market Overview Sheet
  const marketOverview = [
    ['Country', 'Population (M)', 'GDP (B USD)', 'Growth Rate (%)', 'Digital Penetration (%)', 'Market Size (B USD)', 'Opportunity Score'],
    ['Indonesia', 273.5, 1319, 5.2, 73, 287, 78],
    ['Philippines', 109.6, 394, 6.2, 68, 156, 75],
    ['Vietnam', 97.3, 409, 6.8, 75, 142, 82],
    ['Thailand', 69.8, 543, 2.8, 85, 127, 71],
    ['Malaysia', 32.7, 432, 4.5, 78, 98, 73],
    ['Singapore', 5.9, 397, 2.6, 92, 89, 68]
  ];

  // Economic Indicators Sheet
  const economicData = [
    ['Country', 'GDP Growth 2024 (%)', 'Inflation (%)', 'Unemployment (%)', 'Interest Rate (%)', 'USD Exchange Rate', 'Ease of Business (1-100)'],
    ['Indonesia', 5.2, 3.2, 5.8, 6.00, 15750, 68],
    ['Philippines', 6.2, 4.1, 4.5, 6.50, 56.25, 65],
    ['Vietnam', 6.8, 3.6, 2.3, 4.50, 24350, 70],
    ['Thailand', 2.8, 1.2, 1.1, 2.50, 35.42, 78],
    ['Malaysia', 4.5, 2.8, 3.3, 3.00, 4.68, 73],
    ['Singapore', 2.6, 2.1, 2.0, 3.50, 1.35, 95]
  ];

  // Digital Adoption Sheet
  const digitalData = [
    ['Country', 'Internet Penetration (%)', 'Mobile Penetration (%)', 'Social Media Users (%)', 'E-commerce Adoption (%)', 'Digital Payments (%)', 'Cloud Adoption (%)'],
    ['Singapore', 89, 92, 85, 78, 85, 72],
    ['Thailand', 82, 85, 76, 65, 72, 58],
    ['Malaysia', 84, 78, 81, 58, 68, 54],
    ['Indonesia', 71, 73, 68, 52, 61, 45],
    ['Philippines', 67, 68, 72, 45, 55, 41],
    ['Vietnam', 77, 75, 74, 49, 58, 43]
  ];

  // Industry Analysis Sheet
  const industryData = [
    ['Industry', 'Market Size (B USD)', 'Growth Rate (%)', 'Competition Level', 'Opportunity Score', 'Key Trends'],
    ['Technology & Software', 89.2, 12.4, 'High', 85, 'AI/ML adoption, Cloud migration, Mobile-first'],
    ['E-commerce & Retail', 156.7, 18.6, 'High', 78, 'Social commerce, Cross-border, Sustainability'],
    ['Financial Services', 67.3, 15.2, 'Medium', 92, 'Digital banking, Cryptocurrency, SME lending'],
    ['Automotive', 45.8, 8.3, 'Medium', 71, 'Electric vehicles, Ride-sharing, Autonomous'],
    ['Healthcare & Pharma', 78.4, 9.7, 'Low', 88, 'Telemedicine, Digital therapeutics, Personalized'],
    ['Manufacturing', 234.1, 6.8, 'Medium', 65, 'Industry 4.0, Supply chain, Green manufacturing']
  ];

  // Consumer Insights Sheet
  const consumerData = [
    ['Behavior Category', 'Penetration (%)', 'Growth Rate (%)', 'Key Insight', 'Market Opportunity'],
    ['Mobile-First Shopping', 78.4, 24.3, 'Consumers prefer mobile apps over desktop', 'Optimize mobile checkout flows'],
    ['Social Commerce', 65.7, 31.8, 'Social media drives 65% of purchase decisions', 'Invest in influencer marketing'],
    ['Digital Payments', 72.1, 28.5, 'Cash-to-digital transition accelerating', 'Partner with local payment providers'],
    ['Sustainability Focus', 54.2, 19.7, 'Growing preference for sustainable products', 'Develop eco-friendly product lines'],
    ['Cross-border Shopping', 43.8, 35.2, 'International brands gaining popularity', 'Optimize logistics and customs'],
    ['Voice Commerce', 28.5, 45.6, 'Voice assistants driving new shopping behaviors', 'Develop voice-optimized experiences']
  ];

  // Each sheet carries its own provenance when detached from the workbook.
  const noticeRows = [
    ['Illustrative static example; verify all figures before decisions.'],
    ['Source', 'src/services/legacyWorkbook.ts'],
    ['observedAt', 'Unavailable; original observations not supplied'],
    ['generatedAt', new Date().toISOString(), 'Export creation only'],
    []
  ];

  // Create worksheets with styling
  const ws1 = XLSX.utils.aoa_to_sheet([...noticeRows, ...marketOverview]);
  const ws2 = XLSX.utils.aoa_to_sheet([...noticeRows, ...economicData]);
  const ws3 = XLSX.utils.aoa_to_sheet([...noticeRows, ...digitalData]);
  const ws4 = XLSX.utils.aoa_to_sheet([...noticeRows, ...industryData]);
  const ws5 = XLSX.utils.aoa_to_sheet([...noticeRows, ...consumerData]);

  // Add worksheets to workbook
  XLSX.utils.book_append_sheet(workbook, ws1, 'Market Overview');
  XLSX.utils.book_append_sheet(workbook, ws2, 'Economic Indicators');
  XLSX.utils.book_append_sheet(workbook, ws3, 'Digital Adoption');
  XLSX.utils.book_append_sheet(workbook, ws4, 'Industry Analysis');
  XLSX.utils.book_append_sheet(workbook, ws5, 'Consumer Insights');

  // Generate and download
  XLSX.writeFile(workbook, `SEA-Market-Data-${new Date().toISOString().split('T')[0]}.xlsx`);
}
