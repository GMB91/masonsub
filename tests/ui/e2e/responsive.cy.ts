const viewports = [
  { name: "iPhone SE", width: 375, height: 667 },
  { name: "iPhone 6/7/8", width: 414, height: 736 },
  { name: "iPad", width: 768, height: 1024 },
  { name: "iPad Pro", width: 1024, height: 1366 },
  { name: "Desktop", width: 1440, height: 900 },
  { name: "Large Desktop", width: 1920, height: 1080 }
];

describe("Responsive Design", () => {
  viewports.forEach((viewport) => {
    describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      beforeEach(() => {
        cy.viewport(viewport.width, viewport.height);
        cy.visit("/");
        cy.waitForAppReady();
      });

      it("renders header/navigation correctly", () => {
        cy.get("header, nav, [data-testid='header']").should("be.visible");
        
        // Check that Mason Vector branding is visible
        cy.checkMasonVectorBranding();
        
        // Verify navigation doesn't overflow
        cy.get("nav").then(($nav) => {
          if ($nav.length > 0) {
            const navWidth = $nav.width() || 0;
            expect(navWidth).to.be.at.most(viewport.width);
          }
        });
      });

      it("handles mobile navigation appropriately", () => {
        if (viewport.width < 768) {
          // Mobile: Should have hamburger menu or collapsible nav
          cy.get("button[aria-label*='menu'], [data-testid='mobile-menu-toggle'], .hamburger").should("exist");
        } else {
          // Desktop: Should have full navigation visible
          cy.get("nav a, nav button").should("be.visible");
        }
      });

      it("maintains readable text and proper spacing", () => {
        // Check that text is readable (not too small)
        cy.get("body").then(($body) => {
          const fontSize = $body.css("font-size");
          const size = parseFloat(fontSize);
          expect(size).to.be.at.least(14); // Minimum readable font size
        });
        
        // Check that containers don't exceed viewport width
        cy.get("main, .container, [data-testid='main-content']").then(($containers) => {
          if ($containers.length > 0) {
            $containers.each((index, container) => {
              const containerWidth = Cypress.$(container).outerWidth() || 0;
              expect(containerWidth).to.be.at.most(viewport.width);
            });
          }
        });
      });

      it("ensures interactive elements are appropriately sized", () => {
        // Buttons should be large enough for touch on mobile
        cy.get("button").each(($btn) => {
          const height = $btn.outerHeight() || 0;
          const width = $btn.outerWidth() || 0;
          
          if (viewport.width < 768) {
            // Mobile: buttons should be at least 44px (Apple guidelines)
            expect(height).to.be.at.least(40);
            expect(width).to.be.at.least(40);
          } else {
            // Desktop: buttons should be reasonable size
            expect(height).to.be.at.least(32);
            expect(width).to.be.at.least(60);
          }
        });
        
        // Links should have adequate spacing on mobile
        if (viewport.width < 768) {
          cy.get("nav a, .nav-link").each(($link) => {
            const height = $link.outerHeight() || 0;
            expect(height).to.be.at.least(44);
          });
        }
      });

      it("handles content layout appropriately", () => {
        // Check that content doesn't horizontally overflow
        cy.get("body").then(($body) => {
          const bodyWidth = $body.width() || 0;
          expect(bodyWidth).to.be.at.most(viewport.width + 20); // Allow small buffer for scrollbars
        });
        
        // Verify no horizontal scrolling is needed
        cy.window().its("document.documentElement.scrollWidth").should("be.lte", viewport.width + 20);
      });

      it("tests form elements responsiveness", () => {
        cy.get("form").then(($forms) => {
          if ($forms.length > 0) {
            cy.get("form").within(() => {
              // Form inputs should be properly sized
              cy.get("input, textarea, select").each(($input) => {
                const width = $input.outerWidth() || 0;
                
                if (viewport.width < 768) {
                  // Mobile: inputs should be full width or properly contained
                  expect(width).to.be.at.most(viewport.width - 40); // Account for padding
                } else {
                  // Desktop: inputs should be reasonable width
                  expect(width).to.be.at.least(200);
                }
              });
            });
          }
        });
      });
    });
  });

  describe("Cross-viewport consistency", () => {
    it("maintains brand colors across all viewports", () => {
      viewports.forEach((viewport) => {
        cy.viewport(viewport.width, viewport.height);
        cy.visit("/");
        cy.waitForAppReady();
        
        // Check that primary colors are consistent
        cy.get("button").first().then(($btn) => {
          if ($btn.length > 0) {
            cy.wrap($btn).should("have.css", "background-color")
              .and("match", /(rgb\(79, 70, 229\)|rgb\(99, 102, 241\)|rgb\(124, 58, 237\))/);
          }
        });
      });
    });

    it("ensures consistent navigation structure", () => {
      const navigationItems: string[] = [];
      
      // Desktop: collect navigation items
      cy.viewport(1440, 900);
      cy.visit("/");
      cy.waitForAppReady();
      
      cy.get("nav a, nav button").then(($items) => {
        if ($items.length > 0) {
          $items.each((index, item) => {
            const text = Cypress.$(item).text().trim();
            if (text) navigationItems.push(text);
          });
          
          // Mobile: verify same items are available (might be in hamburger menu)
          cy.viewport("iphone-6");
          cy.visit("/");
          cy.waitForAppReady();
          
          if (navigationItems.length > 0) {
            // Try to open mobile menu if it exists
            cy.get("button[aria-label*='menu'], [data-testid='mobile-menu-toggle']").then(($toggle) => {
              if ($toggle.length > 0) {
                cy.wrap($toggle.first()).click();
              }
            });
            
            // Check that navigation items are available
            navigationItems.forEach((item) => {
              cy.get("body").should("contain.text", item);
            });
          }
        }
      });
    });
  });

  describe("Performance on different viewports", () => {
    it("loads quickly on mobile devices", () => {
      cy.viewport("iphone-6");
      
      const startTime = Date.now();
      cy.visit("/");
      cy.waitForAppReady();
      
      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(5000); // Should load within 5 seconds
      });
    });

    it("handles viewport changes gracefully", () => {
      // Start on desktop
      cy.viewport(1440, 900);
      cy.visit("/");
      cy.waitForAppReady();
      
      // Switch to mobile
      cy.viewport("iphone-6");
      cy.wait(500); // Allow time for responsive changes
      
      // Verify layout still works
      cy.get("header, nav").should("be.visible");
      cy.checkMasonVectorBranding();
      
      // Switch back to desktop
      cy.viewport(1440, 900);
      cy.wait(500);
      
      // Verify layout is restored
      cy.get("header, nav").should("be.visible");
      cy.checkMasonVectorBranding();
    });
  });
});