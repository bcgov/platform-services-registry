import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import 'cypress-keycloak';
import { getISODate } from '../../support/utils/getISODate';
import { createRequest } from '../../e2e/create-test.cy';

const productName: string = 'Test Product Cypress ' + getISODate();
const adminEmail: string = Cypress.env('admin_login');
const userEmail: string = Cypress.env('user_login');
const adminPassword: string = Cypress.env('admin_password');
const userPassword: string = Cypress.env('user_password');
let licensePlate: string = '';

Given('I am logged in to the Registry as a User', () => {
  cy.loginToRegistry(userEmail, userPassword);
});

When('I Create a request with random values', () => {
  createRequest(productName, adminEmail, userEmail);
  cy.contains('p', 'Products with pending requests').should('be.visible');
});

When('I log out', () => {
  cy.logoutFromRegistry();
});

When('I log in as an Approval Admin', () => {
  cy.loginToRegistry(adminEmail, adminPassword);
});

When('I approve the Create Request', () => {
  cy.contains('a', productName).click();
  cy.contains('button', 'APPROVE REQUEST');
});

When('I log out', () => {
  cy.logoutFromRegistry();
});

When('And I log in as a User', () => {
  cy.loginToRegistry(userEmail, userPassword);
});

When('And I create a Delete Request', () => {
  cy.contains('a', productName).click();
  cy.contains('button', 'Options').click();
  cy.contains('button', 'Delete').click();
  cy.contains('p', 'License Plate')
    .siblings('p')
    .eq(1)
    .invoke('text')
    .then((text) => {
      // Store the text content into a variable
      licensePlate = text.trim();
    });
  cy.get('input[id="license-plate"]').type(licensePlate);
  cy.get('input[id="owner-email"]').type(userEmail);
  cy.contains('button', 'Delete').click();
  cy.contains('button', 'Return to Dashboard').click();
});

When('I log out', () => {
  cy.logoutFromRegistry();
});

When('I log in as an Approval Admin', () => {
  cy.loginToRegistry(adminEmail, adminPassword);
});

When('I approve the Delete Request', () => {
  cy.contains('a', productName).click();
  cy.contains('button', 'APPROVE REQUEST');
});

Then('I cannot see the Product on the Products tab', () => {
  cy.contains('a', 'productName').should('not.exist');
});
