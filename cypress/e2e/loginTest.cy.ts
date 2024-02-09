describe('Registry App Login', () => {
  it('Verifies that error message after auth call to backend and user db is shown after login attempt', () => {
    cy.loginToRegistry(Cypress.env('username'), Cypress.env('password'));
  });
});
