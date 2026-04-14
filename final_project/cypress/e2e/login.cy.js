describe('Login Flow', () => {
  beforeEach(() => {
    // Replace with the URL where your HTML is served
    cy.visit('http://localhost:3000'); 
  });

  it('should show an alert on invalid credentials', () => {
    // Intercept the POST request and return a 401 error
    cy.intercept('POST', '**/login', {
      statusCode: 401,
      body: { error: 'Invalid credentials' },
    }).as('loginRequest');

    cy.get('[data-cy="email-input"]').type('wrong@user.com');
    cy.get('[data-cy="password-input"]').type('wrongpass');
    cy.get('[data-cy="login-submit"]').click();

    cy.wait('@loginRequest');
    
    // Check if the alert is called (Cypress handles alerts automatically)
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Invalid credentials');
    });
  });

  it('should store token and redirect on success', () => {
    // Mock a successful login response
    cy.intercept('POST', '**/login', {
      statusCode: 200,
      body: { token: 'fake-jwt-token' },
    }).as('loginSuccess');

    cy.get('[data-cy="email-input"]').type('test@test.com');
    cy.get('[data-cy="password-input"]').type('password123');
    cy.get('[data-cy="login-submit"]').click();

    cy.wait('@loginSuccess').then(() => {
      // Verify local storage
      expect(localStorage.getItem('token')).to.eq('fake-jwt-token');
    });

    // Verify redirect
    cy.url().should('include', '/home');
  });
});