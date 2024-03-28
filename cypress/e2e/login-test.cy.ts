describe('Registry App Login', () => {
 it('Logs in', () => {
    cy.loginToRegistry(Cypress.env('username'), Cypress.env('password'));
  });
});
