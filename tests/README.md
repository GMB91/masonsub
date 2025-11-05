# 🧩 Mason Vector UI Test Suite

A comprehensive Cypress-based test framework for validating the Mason Vector App's user interface, branding consistency, navigation, accessibility, and responsive design.

## 🚀 Quick Start

### Installation

```bash
# Install dependencies (already done if you've run npm install)
npm install -D cypress axe-core cypress-axe
```

### Running Tests

```bash
# Run all UI tests with report generation
npm run test:ui

# Open Cypress Test Runner for interactive testing
npm run test:ui:open

# Run tests in Chrome browser
npm run test:ui:chrome
```

## 📁 Test Structure

```
tests/
  ui/
    e2e/
      ├── branding.cy.ts      # Brand consistency tests
      ├── navigation.cy.ts    # Navigation and routing tests
      ├── accessibility.cy.ts # WCAG 2.1 AA accessibility tests
      └── responsive.cy.ts    # Responsive design tests
    support/
      └── e2e.ts             # Global commands and setup
    fixtures/
      └── empty.json         # Mock API responses
    screenshots/             # Test screenshots
    └── reports/            # HTML reports
```

## 🧪 Test Categories

### 🎨 Branding & Visual Consistency
- **Mason Vector Logo & Identity**: Validates proper branding display
- **Color Scheme**: Ensures indigo/purple theme consistency (#4F46E5, #6366F1, #7C3AED)
- **Typography**: Verifies Inter font family usage
- **Spacing & Layout**: Checks consistent padding and margins

### 🧭 Navigation & Routing
- **Page Loading**: Tests all routes load without errors
- **Mobile Navigation**: Validates hamburger menu functionality
- **Browser Navigation**: Tests back/forward button behavior
- **Active States**: Ensures proper navigation highlighting

### ♿ Accessibility (WCAG 2.1 AA)
- **Color Contrast**: Validates 4.5:1 contrast ratios
- **Keyboard Navigation**: Tests tab order and focus management
- **Screen Readers**: Validates ARIA attributes and semantic HTML
- **Form Accessibility**: Ensures proper labels and fieldsets

### 📱 Responsive Design
- **Mobile (375px-414px)**: iPhone SE, iPhone 6/7/8
- **Tablet (768px-1024px)**: iPad, iPad Pro
- **Desktop (1440px+)**: Desktop and large screens
- **Touch Interactions**: Validates 44px+ touch targets

## ⚙️ Configuration

### Cypress Configuration (`cypress.config.ts`)

```typescript
export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    supportFile: "tests/ui/support/e2e.ts",
    screenshotsFolder: "tests/ui/screenshots",
    video: false,
  },
  viewportWidth: 1440,
  viewportHeight: 900,
  retries: 1,
});
```

### Custom Commands

The test suite includes custom Cypress commands:

```typescript
// Check accessibility compliance
cy.checkAccessibility();

// Wait for app to be ready
cy.waitForAppReady();

// Verify Mason Vector branding
cy.checkMasonVectorBranding();
```

## 📊 Test Reports

After running tests, you'll find:

- **HTML Report**: `tests/ui/reports/index.html` - Comprehensive branded report
- **Screenshots**: `tests/ui/screenshots/` - Failure screenshots and comparisons
- **JSON Results**: `tests/ui/reports/results.json` - Raw test data

### Sample Report Features

- ✅ Visual pass/fail status with Mason Vector branding
- 📊 Test coverage breakdown by category
- ⏱️ Execution time and performance metrics
- 📸 Failure screenshots with context
- 🎯 Specific recommendations for fixes

## 🔧 CI/CD Integration

### GitHub Actions

The test suite includes a GitHub Actions workflow (`.github/workflows/ui-tests.yml`) that:

1. Builds the Mason Vector app
2. Starts the development server
3. Runs the complete UI test suite
4. Uploads test reports as artifacts
5. Continues on test warnings (doesn't fail CI)

### Usage in CI

```yaml
- name: Run UI Tests
  run: npm run test:ui || echo "UI tests completed with warnings"
```

## 🎯 Test Philosophy

### Comprehensive Coverage
- **Brand Protection**: Ensures Mason Vector identity is consistent
- **User Experience**: Validates intuitive navigation and interaction
- **Accessibility First**: WCAG 2.1 AA compliance for inclusive design
- **Mobile Ready**: Mobile-first responsive design validation

### Failure Tolerance
- Tests continue on warnings to avoid blocking deployments
- Detailed reporting helps prioritize fixes
- Screenshots provide immediate visual feedback

## 🚀 Development Workflow

### 1. Write New Features
```bash
# Start development server
npm run dev
```

### 2. Test During Development
```bash
# Open Cypress for interactive testing
npm run test:ui:open
```

### 3. Pre-commit Testing
```bash
# Run full test suite
npm run test:ui
```

### 4. Review Reports
- Open `tests/ui/reports/index.html` in browser
- Check screenshots in `tests/ui/screenshots/`
- Address any accessibility or responsive issues

## 📝 Adding New Tests

### Branding Tests
Add to `branding.cy.ts` for:
- New color scheme validation
- Additional typography checks
- Logo/favicon updates

### Navigation Tests  
Add to `navigation.cy.ts` for:
- New routes or pages
- Updated navigation structure
- New interactive elements

### Accessibility Tests
Add to `accessibility.cy.ts` for:
- Form validation improvements
- New ARIA implementations
- Custom accessibility features

### Responsive Tests
Add to `responsive.cy.ts` for:
- New breakpoints
- Component-specific responsive behavior
- Performance on different devices

## 🛠️ Troubleshooting

### Common Issues

**Tests fail on CI but pass locally:**
- Ensure `npm run build` works without errors
- Check that the app starts on port 3000
- Verify environment variables are set in CI

**Accessibility tests failing:**
- Run `cy.checkAccessibility()` on individual pages
- Check browser console for axe-core violations
- Validate ARIA attributes and contrast ratios

**Responsive tests timing out:**
- Increase viewport change wait times
- Check for JavaScript errors on mobile
- Ensure touch events are properly handled

### Debug Mode

```bash
# Run with debug output
DEBUG=cypress:* npm run test:ui

# Run specific test file
npx cypress run --spec "tests/ui/e2e/branding.cy.ts"
```

## 📚 Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [cypress-axe Accessibility Testing](https://github.com/component-driven/cypress-axe)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Mason Vector Design System](../docs/design-system.md)

---

**Mason Vector Quality Assurance Team**  
*Ensuring exceptional user experiences through comprehensive testing*