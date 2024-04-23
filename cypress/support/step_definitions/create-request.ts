import { When, Then, Given } from '@badeball/cypress-cucumber-preprocessor';
import { getISODate } from '../utils/getISODate';
import { createRequest } from '../../e2e/create-test.cy';
// prepare data for test
const productName: string = 'Test Product Cypress ' + getISODate();
const POEmail: string = Cypress.env('admin_login');
const TLEmail: string = Cypress.env('user_login');

Given('I am logged in to the Registry', () => {
  cy.log('=====POEmail: ', POEmail);
  cy.log('=====TLEmail: ', TLEmail);
  cy.loginToRegistry(Cypress.env('user_login'), Cypress.env('user_password'));
});

When('I Create a request', () => {
  createRequest(productName, POEmail, TLEmail);
});

Then('I should be redirected to the In Progress tab', () => {
  cy.contains('p', 'Products with pending requests').should('be.visible');
});

Then('I should see the corresponding request', () => {
  cy.contains('span', productName).should('be.visible');
});
