export function createRequest(productName: string, POEmail: string, TLEmail: string) {
  cy.wait(2000);
  cy.contains('a', 'REQUEST A NEW PRODUCT').should('be.not.disabled').click({ force: true });
  cy.get('input[name="name"]').type(productName);
  cy.get('textarea[id="about"]').type('The description of Test Product Cypress');
  cy.get('select[id="ministry"]').select('Citizens Services');
  cy.get('select[name="cluster"]').select('SILVER');
  cy.contains('p', 'Team contacts').click();
  cy.contains('label', 'Product Owner email').parent().find('input').first().type(POEmail.slice(0, 8));
  cy.contains('span', POEmail).click();
  cy.contains('label', 'Technical Lead email').parent().find('input').first().type(TLEmail.slice(0, 11));
  cy.contains('span', TLEmail).click();
  cy.contains('p', 'Common components').click();
  cy.get('input[name="commonComponents.other"]').type('Other common component field');
  cy.get('button[type="submit"]').click();
  cy.get('input[id="consent"]').click();
  cy.contains('span', 'Submit').click();
  cy.contains('button', 'Return to Dashboard').click();
  cy.wait(5000);
  cy.contains('span', productName).should('be.visible');
}
