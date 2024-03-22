import { When, Then, Given } from '@badeball/cypress-cucumber-preprocessor';

Given('I am on the Registry App login page', () => {
  cy.visit('/login', { failOnStatusCode: false });
  cy.contains('button', 'LOGIN').click();
  cy.contains('span', 'Sign in with Keycloak').click();
});

When('I type and submit in login and password', () => {
  cy.get('input[id="username"]').type(Cypress.env('username'));
  cy.get('input[id="password"]').type(Cypress.env('password'));
  cy.get('input[type="submit"]').click();
});

Then("I should see 'Create' button", () => {
  cy.contains('a', 'REQUEST A NEW PRODUCT');
});
