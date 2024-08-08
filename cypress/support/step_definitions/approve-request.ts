import { When, Then, Given } from '@badeball/cypress-cucumber-preprocessor';
import { createRequest } from '../../e2e/create-test.cy';
import { getISODate } from '../utils/getISODate';
// prepare data for test
const productName: string = 'Test Product Cypress ' + getISODate();

Given(/^There is a request with names (.*) and (.*) waiting for Review$/, (POEmail: string, TLEmail: string) => {
  createRequest(productName, POEmail, TLEmail);
});

Given(/^User logs in with username (.*) and password (.*)$/, (username: string, password: string) => {
  cy.loginToRegistry(username, password);
});

When(/^User clicks link with text (.*)$/, (buttonText: string) => {
  cy.contains('a', buttonText).click();
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

When('User navigates to Request Decision Page', () => {
  cy.contains('span', productName).click();
});

When('User clicks Approve Request button', () => {
  cy.contains('button', 'APPROVE REQUEST');
});

When(/^User clicks button with text (.*)$/, (buttonText: string) => {
  cy.contains('button', buttonText).click();
});

When('User clicks Return to Dashboard in Thank You Popup', () => {
  cy.contains('button', 'Return to Dashboard').click();
});

Then('User should see the Product', () => {
  cy.contains('span', productName).should('be.visible');
});

Then('User should not see the Product', () => {
  cy.contains('span', productName).should('not.be.visible');
});
