describe("Accessibility Audit", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.waitForAppReady();
  });

  it("scans homepage for WCAG violations", () => {
    cy.checkAccessibility();
  });

  it("scans dashboard for WCAG violations", () => {
    cy.visit("/dashboard");
    cy.waitForAppReady();
    cy.checkAccessibility();
  });

  it("scans claimants page for WCAG violations", () => {
    cy.visit("/claimants");
    cy.waitForAppReady();
    cy.checkAccessibility();
  });

  it("checks keyboard navigation", () => {
    cy.visit("/");
    cy.waitForAppReady();
    
    // Test Tab navigation through focusable elements
    cy.get("body").type("{tab}").then(() => {
      // Verify that Tab key moves focus
      cy.focused().should("exist");
    });
    
    // Test multiple Tab presses
    cy.get("body").type("{tab}{tab}").then(() => {
      cy.focused().should("exist");
    });
  });

  it("validates heading hierarchy", () => {
    const pages = ["/", "/dashboard", "/claimants"];
    
    pages.forEach((page) => {
      cy.visit(page);
      cy.waitForAppReady();
      
      cy.get("h1, h2, h3, h4, h5, h6").then(($headings) => {
        if ($headings.length > 0) {
          // Check that page has an h1
          cy.get("h1").should("exist");
          
          // Verify heading hierarchy (h1 -> h2 -> h3, etc.)
          let previousLevel = 0;
          $headings.each((index, heading) => {
            const level = parseInt(heading.tagName.charAt(1));
            if (previousLevel !== 0) {
              expect(level).to.be.at.most(previousLevel + 1);
            }
            previousLevel = level;
          });
        }
      });
    });
  });

  it("checks color contrast ratios", () => {
    cy.visit("/");
    cy.waitForAppReady();
    
    // Inject axe and run contrast-specific tests
    cy.injectAxe();
    cy.checkA11y(undefined, {
      runOnly: ['color-contrast'],
      reporter: 'v2'
    });
  });

  it("validates form accessibility", () => {
    // Check all pages for forms and validate accessibility
    const pages = ["/", "/dashboard", "/claimants", "/settings"];
    
    pages.forEach((page) => {
      cy.visit(page);
      cy.waitForAppReady();
      
      cy.get("form").then(($forms) => {
        if ($forms.length > 0) {
          cy.get("form").within(() => {
            // Check that all form inputs have labels
            cy.get("input, textarea, select").each(($input) => {
              const id = $input.attr("id");
              const ariaLabel = $input.attr("aria-label");
              const ariaLabelledBy = $input.attr("aria-labelledby");
              
              if (id) {
                cy.get(`label[for="${id}"]`).should("exist");
              } else {
                expect(ariaLabel || ariaLabelledBy).to.exist;
              }
            });
            
            // Check for fieldsets with legends if multiple related inputs
            cy.get("fieldset").then(($fieldsets) => {
              if ($fieldsets.length > 0) {
                cy.get("fieldset").should("contain", "legend");
              }
            });
          });
        }
      });
    });
  });

  it("validates ARIA attributes", () => {
    cy.visit("/");
    cy.waitForAppReady();
    
    // Check for proper ARIA usage
    cy.get("[aria-expanded]").each(($el) => {
      const expanded = $el.attr("aria-expanded");
      expect(expanded).to.match(/^(true|false)$/);
    });
    
    cy.get("[aria-hidden]").each(($el) => {
      const hidden = $el.attr("aria-hidden");
      expect(hidden).to.match(/^(true|false)$/);
    });
    
    // Check that interactive elements have proper roles
    cy.get("button, [role='button']").should("be.visible");
  });

  it("checks focus management", () => {
    cy.visit("/");
    cy.waitForAppReady();
    
    // Verify that focus is visible
    cy.get("a, button, input, textarea, select").first().focus();
    cy.focused().should(($el) => {
      const outlineStyle = $el.css("outline-style");
      const boxShadow = $el.css("box-shadow");
      const borderColor = $el.css("border-color");
      
      const hasFocusIndicator = outlineStyle === "solid" || 
                               boxShadow !== "none" || 
                               borderColor !== "rgba(0, 0, 0, 0)";
      expect(hasFocusIndicator).to.be.true;
    });
  });

  it("validates skip links", () => {
    cy.visit("/");
    cy.waitForAppReady();
    
    // Check for skip to content links
    cy.get("body").type("{tab}");
    cy.get("a[href='#main'], a[href='#content'], [data-testid='skip-link']").then(($skipLinks) => {
      if ($skipLinks.length > 0) {
        cy.wrap($skipLinks.first()).should("be.visible");
      }
    });
  });

  it("tests screen reader announcements", () => {
    cy.visit("/");
    cy.waitForAppReady();
    
    // Check for live regions
    cy.get("[aria-live], [role='status'], [role='alert']").then(($liveRegions) => {
      if ($liveRegions.length > 0) {
        $liveRegions.each((index, region) => {
          const ariaLive = Cypress.$(region).attr("aria-live");
          if (ariaLive) {
            expect(ariaLive).to.match(/^(polite|assertive|off)$/);
          }
        });
      }
    });
  });

  it("validates image alt text", () => {
    const pages = ["/", "/dashboard", "/claimants"];
    
    pages.forEach((page) => {
      cy.visit(page);
      cy.waitForAppReady();
      
      cy.get("img").each(($img) => {
        const alt = $img.attr("alt");
        const ariaLabel = $img.attr("aria-label");
        const ariaLabelledBy = $img.attr("aria-labelledby");
        const role = $img.attr("role");
        
        // Images should have alt text or be marked as decorative
        if (role !== "presentation" && !ariaLabel && !ariaLabelledBy) {
          expect(alt).to.exist;
        }
      });
    });
  });
});