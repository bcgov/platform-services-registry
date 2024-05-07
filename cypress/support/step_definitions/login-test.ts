import { When, Then, Given } from '@badeball/cypress-cucumber-preprocessor';

Given('I am on the Registry App login page', () => {
  cy.visit('/login', { failOnStatusCode: false });
  cy.contains('button', 'LOGIN');
});

When('I type in and submit login and password', () => {
  cy.loginToRegistry(Cypress.env('username'), Cypress.env('password'));
});

Then("I should see 'Create' button", () => {
  cy.contains('a', 'REQUEST A NEW PRODUCT');
});
