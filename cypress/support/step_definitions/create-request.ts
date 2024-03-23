import { When, Then, Given } from '@badeball/cypress-cucumber-preprocessor';

Given('I am logged in to the Registry', () => {
  cy.loginToRegistry(Cypress.env('username'), Cypress.env('password'));
});

When('I Create a request with random values', () => {
  cy.contains('a', 'REQUEST A NEW PRODUCT').should('be.not.disabled').click({ force: true });
  cy.contains('a', 'REQUEST A NEW PRODUCT').should('be.not.disabled').click({ force: true });
});

Then('I should be redirected to the In Progress tab', () => {
  cy.contains('p', 'Please provide a descriptive');
});
