#!/usr/bin/env node

/**
 * Mason Vector UI Test Runner
 * Comprehensive test execution with reporting
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPORT_DIR = path.join(__dirname, '../tests/ui/reports');
const SCREENSHOTS_DIR = path.join(__dirname, '../tests/ui/screenshots');

// Ensure directories exist
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

console.log('🧩 Mason Vector UI Test Suite');
console.log('==============================');

const startTime = Date.now();

try {
  // Run Cypress tests
  console.log('🚀 Starting Cypress UI tests...');
  
  const cypressCommand = process.argv.includes('--open') 
    ? 'npx cypress open'
    : 'npx cypress run --headless --reporter json --reporter-options "output=tests/ui/reports/results.json"';
  
  execSync(cypressCommand, { 
    stdio: 'inherit',
    cwd: __dirname + '/..'
  });
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n✅ UI Tests completed successfully!');
  console.log(`⏱️  Duration: ${duration}s`);
  console.log(`📊 Results: tests/ui/reports/`);
  console.log(`📸 Screenshots: tests/ui/screenshots/`);
  
  // Generate summary report
  generateSummaryReport(duration);
  
} catch (error) {
  console.error('\n❌ UI Tests failed!');
  console.error('Error:', error.message);
  
  // Still generate report for failed tests
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  generateSummaryReport(duration, true);
  
  process.exit(1);
}

function generateSummaryReport(duration, failed = false) {
  const reportPath = path.join(REPORT_DIR, 'index.html');
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mason Vector UI Test Report</title>
    <style>
        body { 
            font-family: 'Inter', system-ui, sans-serif; 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 2rem;
            background: #f8fafc;
        }
        .header { 
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
            color: white; 
            padding: 2rem; 
            border-radius: 12px; 
            margin-bottom: 2rem;
        }
        .status { 
            display: inline-block;
            padding: 0.5rem 1rem; 
            border-radius: 6px; 
            font-weight: 600;
        }
        .success { background: #10b981; color: white; }
        .failure { background: #ef4444; color: white; }
        .card { 
            background: white; 
            padding: 1.5rem; 
            border-radius: 8px; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            margin-bottom: 1rem;
        }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; }
        .test-category { 
            border-left: 4px solid #4f46e5; 
            padding-left: 1rem;
        }
        .timestamp { color: #6b7280; font-size: 0.9rem; }
        .footer { text-align: center; margin-top: 2rem; color: #6b7280; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧩 Mason Vector UI Test Report</h1>
        <div class="status ${failed ? 'failure' : 'success'}">
            ${failed ? '❌ Tests Failed' : '✅ Tests Passed'}
        </div>
        <div class="timestamp">Generated: ${new Date().toLocaleString()}</div>
        <div>Duration: ${duration}s</div>
    </div>

    <div class="grid">
        <div class="card test-category">
            <h3>🎨 Branding & Visual Consistency</h3>
            <p>Validates Mason Vector color scheme, typography, and visual identity across all pages.</p>
            <ul>
                <li>Logo and header branding verification</li>
                <li>Indigo/Purple color theme validation</li>
                <li>Inter font family consistency</li>
                <li>Consistent spacing and layout</li>
            </ul>
        </div>

        <div class="card test-category">
            <h3>🧭 Navigation & Routing</h3>
            <p>Ensures all routes load correctly and navigation functions properly.</p>
            <ul>
                <li>Page loading without errors</li>
                <li>Mobile navigation (hamburger menu)</li>
                <li>Browser back/forward functionality</li>
                <li>Active navigation states</li>
            </ul>
        </div>

        <div class="card test-category">
            <h3>♿ Accessibility (WCAG AA)</h3>
            <p>Comprehensive accessibility audit against WCAG 2.1 AA standards.</p>
            <ul>
                <li>Color contrast ratios</li>
                <li>Keyboard navigation</li>
                <li>Screen reader compatibility</li>
                <li>Form accessibility</li>
            </ul>
        </div>

        <div class="card test-category">
            <h3>📱 Responsive Design</h3>
            <p>Tests layout and functionality across multiple device sizes.</p>
            <ul>
                <li>Mobile (375px - 414px)</li>
                <li>Tablet (768px - 1024px)</li>
                <li>Desktop (1440px+)</li>
                <li>Touch-friendly interactions</li>
            </ul>
        </div>
    </div>

    <div class="card">
        <h3>📊 Test Coverage</h3>
        <p>This suite validates:</p>
        <ul>
            <li><strong>Brand Consistency:</strong> Colors, fonts, spacing, and Mason Vector identity</li>
            <li><strong>Navigation:</strong> All routes, mobile menus, and user flows</li>
            <li><strong>Accessibility:</strong> WCAG 2.1 AA compliance for inclusive design</li>
            <li><strong>Responsiveness:</strong> Mobile-first design across all breakpoints</li>
        </ul>
    </div>

    <div class="footer">
        <p>Mason Vector App - Quality Assurance Report</p>
        <p>Screenshots available in: <code>tests/ui/screenshots/</code></p>
    </div>
</body>
</html>`;
  
  fs.writeFileSync(reportPath, html);
  console.log(`📄 HTML Report generated: ${reportPath}`);
}