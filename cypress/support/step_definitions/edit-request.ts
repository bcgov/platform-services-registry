import { When, Then, Given } from '@badeball/cypress-cucumber-preprocessor';
import { createRequest } from '../../e2e/create-test.cy';
import { getISODate } from '../utils/get-iso-date';
// prepare data for test
const productName: string = 'Test Product Cypress ' + getISODate();
const POEmail: string = Cypress.env('admin_login');
const TLEmail: string = Cypress.env('user_login');

When(/^User clicks span with text (.*)$/, (buttonText: string) => {
  cy.contains('span', buttonText).click();
});

When(/^User types and selects (.*) in Secondary (.*)$/, (contactEmail: string, label: string) => {
  cy.contains('label', label).parent().find('input').eq(2).type(contactEmail);
  cy.contains('span', contactEmail).click();
});
