describe("Branding & Visual Consistency", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.waitForAppReady();
  });

  it("checks Mason Vector logo and header branding", () => {
    cy.checkMasonVectorBranding();
    
    // Check for specific Mason Vector branding elements
    cy.get("header, nav, [data-testid='header']")
      .should("contain.text", "Mason Vector")
      .and("be.visible");
  });

  it("validates primary color scheme (Indigo/Purple theme)", () => {
    // Check for primary button colors - Mason Vector uses indigo/purple theme
    cy.get("button").first().then(($btn) => {
      if ($btn.length > 0) {
        cy.wrap($btn).should("have.css", "background-color")
          .and("match", /(rgb\(79, 70, 229\)|rgb\(99, 102, 241\)|rgb\(124, 58, 237\))/); // Various indigo/purple shades
      }
    });

    // Check for accent colors in navigation or key elements
    cy.get("nav a, .nav-link").first().then(($link) => {
      if ($link.length > 0) {
        cy.wrap($link).should("have.css", "color")
          .and("not.equal", "rgba(0, 0, 0, 0)");
      }
    });
  });

  it("validates typography (Inter or system font)", () => {
    cy.get("body").should("have.css", "font-family")
      .and("match", /Inter|system-ui|sans-serif/i);
    
    // Check heading fonts
    cy.get("h1, h2, h3").first().then(($heading) => {
      if ($heading.length > 0) {
        cy.wrap($heading).should("have.css", "font-family")
          .and("match", /Inter|system-ui|sans-serif/i);
      }
    });
  });

  it("checks consistent spacing and layout", () => {
    // Verify consistent padding/margins in main container
    cy.get("main, [data-testid='main-content']").should("exist");
    
    // Check for proper container max-width
    cy.get(".container, main").first().then(($container) => {
      if ($container.length > 0) {
        const width = $container.width();
        expect(width).to.be.greaterThan(300);
      }
    });
  });

  it("validates Mason Vector favicon and meta tags", () => {
    // Check favicon
    cy.get("head link[rel='icon']").should("exist");
    
    // Check meta tags for branding
    cy.get("head title").should("contain", "Mason Vector");
    cy.get("head meta[name='description']").should("exist");
  });

  it("checks brand consistency across interactive elements", () => {
    // Check button hover states (if any buttons exist)
    cy.get("button").first().then(($btn) => {
      if ($btn.length > 0) {
        cy.wrap($btn)
          .should("be.visible")
          .and("have.css", "cursor", "pointer");
      }
    });

    // Check link styling consistency
    cy.get("a").first().then(($link) => {
      if ($link.length > 0) {
        cy.wrap($link).should("have.css", "text-decoration")
          .and("match", /(none|underline)/);
      }
    });
  });
});