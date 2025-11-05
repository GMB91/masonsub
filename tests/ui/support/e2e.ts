import 'cypress-axe';

// Type declarations for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to check accessibility
       */
      checkAccessibility(): Chainable<void>;
      /**
       * Custom command to wait for app to be ready
       */
      waitForAppReady(): Chainable<void>;
      /**
       * Custom command to check Mason Vector branding elements
       */
      checkMasonVectorBranding(): Chainable<void>;
    }
  }
}

// Global accessibility command
Cypress.Commands.add('checkAccessibility', () => {
  cy.injectAxe();
  cy.checkA11y(undefined, { 
    runOnly: ['wcag2a', 'wcag2aa'],
    reporter: 'v2'
  }, (violations) => {
    if (violations.length) {
      cy.task('log', `${violations.length} accessibility violation(s) detected`);
      violations.forEach((violation) => {
        cy.task('log', `${violation.id}: ${violation.description}`);
      });
    }
  });
});

// Wait for app to be ready
Cypress.Commands.add('waitForAppReady', () => {
  cy.get('body').should('exist');
  cy.get('[data-testid="loading"]').should('not.exist');
  cy.wait(1000); // Small buffer for hydration
});

// Check Mason Vector branding elements
Cypress.Commands.add('checkMasonVectorBranding', () => {
  cy.get('header, nav, [data-testid="header"]')
    .should('exist')
    .and('be.visible');
  
  // Check for Mason Vector text or logo
  cy.get('body').should('contain.text', 'Mason Vector');
});

beforeEach(() => {
  cy.viewport(1440, 900);
  
  // Intercept common API calls to prevent network delays in tests
  cy.intercept('GET', '/api/**', { fixture: 'empty.json' }).as('apiCall');
});

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent Cypress from failing the test on uncaught exceptions
  // This is useful for third-party scripts or non-critical errors
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  if (err.message.includes('Non-Error promise rejection captured')) {
    return false;
  }
  return true;
});