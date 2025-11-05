const pages = [
  { path: "/", name: "Home" },
  { path: "/dashboard", name: "Dashboard" },
  { path: "/claimants", name: "Claimants" },
  { path: "/reports", name: "Reports" },
  { path: "/calendar", name: "Calendar" },
  { path: "/settings", name: "Settings" }
];

describe("Navigation & Routing", () => {
  beforeEach(() => {
    // Start from home page
    cy.visit("/");
    cy.waitForAppReady();
  });

  pages.forEach((page) => {
    it(`loads ${page.name} (${page.path}) without error`, () => {
      cy.visit(page.path);
      cy.waitForAppReady();
      
      // Check that no error boundary or 404 is shown
      cy.get("body").should("not.contain.text", "ErrorBoundary");
      cy.get("body").should("not.contain.text", "404");
      cy.get("body").should("not.contain.text", "Page not found");
      
      // Ensure navigation exists
      cy.get("nav, header, [data-testid='navigation']").should("exist");
      
      // Check that the page loads content (not just blank)
      cy.get("body").should("not.be.empty");
    });
  });

  it("validates navigation menu functionality", () => {
    cy.visit("/");
    
    // Check if navigation menu exists and is functional
    cy.get("nav, [data-testid='navigation']").should("exist").and("be.visible");
    
    // Look for common navigation patterns
    cy.get("nav a, nav button, [data-testid='nav-link']").then(($navItems) => {
      if ($navItems.length > 0) {
        // Test first navigation item
        cy.wrap($navItems.first()).should("be.visible");
        
        // If it's a link, test navigation
        if ($navItems.first().is('a')) {
          const href = $navItems.first().attr('href');
          if (href && href !== '#' && !href.startsWith('http')) {
            cy.wrap($navItems.first()).click();
            cy.waitForAppReady();
            cy.url().should('include', href);
          }
        }
      }
    });
  });

  it("checks mobile navigation (hamburger menu)", () => {
    // Test on mobile viewport
    cy.viewport("iphone-6");
    cy.visit("/");
    cy.waitForAppReady();
    
    // Look for mobile menu toggle
    cy.get("button[aria-label*='menu'], [data-testid='mobile-menu-toggle'], .hamburger").then(($toggle) => {
      if ($toggle.length > 0) {
        // Test mobile menu functionality
        cy.wrap($toggle.first()).should("be.visible").click();
        
        // Check if mobile menu opens
        cy.get("[data-testid='mobile-menu'], .mobile-nav").should("be.visible");
      }
    });
  });

  it("validates browser back/forward navigation", () => {
    // Navigate to different pages and test browser navigation
    cy.visit("/");
    cy.waitForAppReady();
    
    cy.visit("/dashboard");
    cy.waitForAppReady();
    cy.url().should("include", "/dashboard");
    
    // Test browser back
    cy.go("back");
    cy.url().should("not.include", "/dashboard");
    
    // Test browser forward
    cy.go("forward");
    cy.url().should("include", "/dashboard");
  });

  it("checks active navigation state", () => {
    pages.forEach((page) => {
      if (page.path !== "/") {
        cy.visit(page.path);
        cy.waitForAppReady();
        
        // Look for active navigation indicators
        cy.get("nav").then(($nav) => {
          if ($nav.length > 0) {
            // Check for active states (common class names)
            cy.get("nav").within(() => {
              cy.get(".active, .current, [aria-current], .bg-indigo, .text-indigo").should("exist");
            });
          }
        });
      }
    });
  });

  it("validates external links open in new tabs", () => {
    cy.visit("/");
    
    // Find external links and check they have proper target attributes
    cy.get("a[href^='http'], a[href^='https://']").then(($links) => {
      if ($links.length > 0) {
        cy.wrap($links).each(($link) => {
          cy.wrap($link).should("have.attr", "target", "_blank")
            .and("have.attr", "rel")
            .and("match", /noopener|noreferrer/);
        });
      }
    });
  });

  it("checks navigation accessibility", () => {
    cy.visit("/");
    cy.waitForAppReady();
    
    // Check navigation has proper ARIA labels
    cy.get("nav").should("exist").then(($nav) => {
      if ($nav.length > 0) {
        // Navigation should have proper semantics
        cy.get("nav").should(($nav) => {
          const hasRole = $nav.attr("role") === "navigation";
          const hasAriaLabel = $nav.attr("aria-label");
          expect(hasRole || hasAriaLabel).to.be.true;
        });
        
        // Navigation items should be properly labeled
        cy.get("nav a, nav button").each(($item) => {
          cy.wrap($item).should("be.visible")
            .and(($el) => {
              const text = $el.text().trim();
              const ariaLabel = $el.attr("aria-label");
              expect(text.length > 0 || ariaLabel).to.be.true;
            });
        });
      }
    });
  });
});