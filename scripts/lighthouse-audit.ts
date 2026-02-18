/**
 * Performance Audit Script
 * Runs Lighthouse CI and generates a report
 * @module scripts/lighthouse-audit
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface LighthouseResult {
  url: string;
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  pwa?: number;
}

interface AuditReport {
  timestamp: string;
  results: LighthouseResult[];
  summary: {
    averagePerformance: number;
    averageAccessibility: number;
    averageBestPractices: number;
    averageSeo: number;
    passed: boolean;
  };
}

const URLS = [
  'http://localhost:3000/',
  'http://localhost:3000/dashboard',
  'http://localhost:3000/quotes',
  'http://localhost:3000/customers',
  'http://localhost:3000/analytics',
];

const THRESHOLDS = {
  performance: 0.8,
  accessibility: 0.9,
  bestPractices: 0.9,
  seo: 0.9,
};

function runLighthouse(url: string): LighthouseResult {
  console.log(`\n🔍 Auditing: ${url}`);
  
  try {
    const outputPath = `/tmp/lighthouse-${Date.now()}.json`;
    
    // Run Lighthouse
    const command = `npx lighthouse ${url} \
      --chrome-flags="--no-sandbox --headless --disable-gpu" \
      --output=json \
      --output-path=${outputPath} \
      --preset=desktop \
      --only-categories=performance,accessibility,best-practices,seo`;
    
    execSync(command, { stdio: 'ignore', timeout: 120000 });
    
    // Parse results
    const results = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
    
    // Clean up
    fs.unlinkSync(outputPath);
    
    return {
      url,
      performance: results.categories.performance?.score || 0,
      accessibility: results.categories.accessibility?.score || 0,
      bestPractices: results.categories['best-practices']?.score || 0,
      seo: results.categories.seo?.score || 0,
    };
  } catch (error) {
    console.error(`❌ Failed to audit ${url}:`, error);
    return {
      url,
      performance: 0,
      accessibility: 0,
      bestPractices: 0,
      seo: 0,
    };
  }
}

function generateReport(results: LighthouseResult[]): AuditReport {
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  
  const summary = {
    averagePerformance: avg(results.map(r => r.performance)),
    averageAccessibility: avg(results.map(r => r.accessibility)),
    averageBestPractices: avg(results.map(r => r.bestPractices)),
    averageSeo: avg(results.map(r => r.seo)),
    passed: 
      avg(results.map(r => r.performance)) >= THRESHOLDS.performance &&
      avg(results.map(r => r.accessibility)) >= THRESHOLDS.accessibility &&
      avg(results.map(r => r.bestPractices)) >= THRESHOLDS.bestPractices &&
      avg(results.map(r => r.seo)) >= THRESHOLDS.seo,
  };
  
  return {
    timestamp: new Date().toISOString(),
    results,
    summary,
  };
}

function formatScore(score: number): string {
  const percentage = Math.round(score * 100);
  if (percentage >= 90) return `🟢 ${percentage}`;
  if (percentage >= 70) return `🟡 ${percentage}`;
  return `🔴 ${percentage}`;
}

function printReport(report: AuditReport): void {
  console.log('\n' + '='.repeat(80));
  console.log('📊 LIGHTHOUSE PERFORMANCE REPORT');
  console.log('='.repeat(80));
  console.log(`\nTimestamp: ${report.timestamp}`);
  
  console.log('\n📄 Page Results:');
  console.log('-'.repeat(80));
  console.log(`${'URL'.padEnd(30)} | Perf | A11y | BP   | SEO`);
  console.log('-'.repeat(80));
  
  for (const result of report.results) {
    const url = result.url.replace('http://localhost:3000', '').padEnd(30);
    console.log(
      `${url} | ${formatScore(result.performance).padStart(4)} | ` +
      `${formatScore(result.accessibility).padStart(4)} | ` +
      `${formatScore(result.bestPractices).padStart(4)} | ` +
      `${formatScore(result.seo).padStart(4)}`
    );
  }
  
  console.log('-'.repeat(80));
  console.log(
    `${'AVERAGE'.padEnd(30)} | ${formatScore(report.summary.averagePerformance).padStart(4)} | ` +
    `${formatScore(report.summary.averageAccessibility).padStart(4)} | ` +
    `${formatScore(report.summary.averageBestPractices).padStart(4)} | ` +
    `${formatScore(report.summary.averageSeo).padStart(4)}`
  );
  
  console.log('\n' + '='.repeat(80));
  console.log(`Overall: ${report.summary.passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log('='.repeat(80) + '\n');
}

function saveReport(report: AuditReport): void {
  const reportsDir = path.join(process.cwd(), 'lighthouse-reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const filename = `lighthouse-report-${new Date().toISOString().split('T')[0]}.json`;
  const filepath = path.join(reportsDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
  console.log(`💾 Report saved to: ${filepath}\n`);
}

// Main execution
console.log('🚀 Starting Lighthouse Performance Audit...\n');
console.log('Note: Ensure the Next.js dev server is running on http://localhost:3000');
console.log('      Run: npm run dev\n');

const results: LighthouseResult[] = [];

for (const url of URLS) {
  const result = runLighthouse(url);
  results.push(result);
}

const report = generateReport(results);
printReport(report);
saveReport(report);

process.exit(report.summary.passed ? 0 : 1);
