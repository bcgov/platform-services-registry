import { When, Then, Given } from '@badeball/cypress-cucumber-preprocessor';
import { createRequest } from '../../e2e/create-test.cy';
import { getISODate } from '../utils/getISODate';
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

Given(/^User logs in with username (.*) and password (.*)$/, (username: string, password: string) => {
  cy.loginToRegistry(username, password);
});

When(/^User clicks link with text (.*)$/, (buttonText: string) => {
  cy.contains('a', buttonText).click();
  cy.log('text button is ' + buttonText);
});

When(
  /^User types (.*) in (.*) with (.*) = (.*)$/,
  (text: string, elementType: string, attribute: string, attributeValue: string) => {
    cy.get(`${elementType}[${attribute}='${attributeValue}']`).type(text + getISODate());
  },
);

When(
  /^User selects (.*) in dropdown with attribute (.*) = (.*)$/,
  (optionText: string, attribute: string, attributeValue: string) => {
    cy.get(`select[${attribute}='${attributeValue}']`).select(optionText);
  },
);

When(/^User inputs and selects (.*) in (.*)$/, (contactEmail: string, label: string) => {
  cy.contains('label', label).parent().find('input').first().type(contactEmail);
  cy.get('li[role="option"]').click();
});

When('User checks Does not Use Common Components', () => {
  cy.get('input[name="commonComponents.other"]').type('Other common component field');
});

When('User clicks Submit Request', () => {
  cy.get('button[type="submit"]').click();
});

When('User checks Confirm in All Set Popup', () => {
  cy.get('input[id="consent"]').click();
});

When('User clicks Submit Request in All Set Popup', () => {
  cy.contains('h3', 'All Set?').parents().eq(2).find('button').contains('SUBMIT REQUEST').click();
});

When('User clicks Return to Dashboard in Thank You Popup', () => {
  cy.contains('button', 'Return to Dashboard').click();
});

Then('User should be redirected to Requests tab', () => {
  cy.contains('p', 'Products with pending requests').should('be.visible');
});

Then('User should see their Request', () => {
  cy.contains('span', productName).should('be.visible');
});
