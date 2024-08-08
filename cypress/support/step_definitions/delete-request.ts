import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import 'cypress-keycloak';
import { createRequest } from '../../e2e/create-test.cy';
import { getISODate } from '../../support/utils/getISODate';

const productName: string = 'Test Product Cypress ' + getISODate();

let licencePlate: string = '';

Given('I am logged in to the Registry', () => {
  cy.loginToRegistry(Cypress.env('user_login'), Cypress.env('user_password'));
});

Given(/^There is a request with names (.*) and (.*) waiting for Review$/, (POEmail: string, TLEmail: string) => {
  createRequest(productName, POEmail, TLEmail);
});

When('User navigates to Product Page', () => {
  cy.contains('span', productName).click();
});

When('User logs out', () => {
  cy.logoutFromRegistry();
  cy.clearAllCookies();
});

When('User inputs Licence Plate', () => {
  cy.contains('p', 'Licence Plate')
    .siblings('p')
    .eq(1)
    .invoke('text')
    .then((text) => {
      // Store the text content into a variable
      licencePlate = text.trim();
    });
  cy.get('input[id="licence-plate"]').type(licencePlate);
});
