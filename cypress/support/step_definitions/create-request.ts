import { When, Then, Given } from '@badeball/cypress-cucumber-preprocessor';
import { getISODate } from '../utils/getISODate';
// prepare data for test
const productName: string = 'Test Product Cypress ' + getISODate();

Given('I am logged in to the Registry', () => {
  cy.loginToRegistry(Cypress.env('username'), Cypress.env('password'));
});

When('I Create a request with random values', () => {
  cy.contains('a', 'REQUEST A NEW PRODUCT').should('be.not.disabled').click({ force: true });
  cy.wait(2000);
  cy.contains('a', 'REQUEST A NEW PRODUCT').should('be.not.disabled').click({ force: true });
  cy.get('input[name="name"]').type(productName);
  cy.get('textarea[id="about"]').type('The description of Test Product Cypress');
  cy.get('select[id="ministry"]').select('Citizens Services');
  cy.get('select[name="cluster"]').select('SILVER');
  cy.contains('label', 'Product Owner Email').parent().find('input').first().type('artem.kr');
  cy.get('li[role="option"]').click();
  cy.contains('label', 'Technical Lead Email').parent().find('input').first().type('platform.se');
  cy.get('li[role="option"]').click();
  cy.get('input[name="commonComponents.other"]').type('Other common component');
  cy.get('button[type="submit"]').click();
  cy.contains('p', 'By checking this box, I confirm ').parent().find('input[type="checkbox"]').click();
  cy.contains('h3', 'All Set?').parents().eq(2).find('button').contains('SUBMIT REQUEST').click();
  cy.contains('button', 'Return to Dashboard').click();
});

Then('I should be redirected to the In Progress tab', () => {
  cy.contains('p', 'Products with pending requests').should('be.visible');
  cy.contains('span', productName);
});
