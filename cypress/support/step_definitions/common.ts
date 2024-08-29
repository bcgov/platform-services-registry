import { When, Then, Given } from '@badeball/cypress-cucumber-preprocessor';
import { createRequest } from 'e2e/create-test.cy';

Given(/^User logs in with username "(.*)" and password "(.*)"$/, (username: string, password: string) => {
  cy.loginToRegistry(username, password);
});

Given(
  /^Request exists with name "(.*)" and contacts "(.*)" and "(.*)"$/,
  (productName: string, POEmail: string, TLEmail: string) => {
    createRequest(productName, POEmail, TLEmail);
  },
);

When(/^User clicks link "(.*)"$/, (buttonText: string) => {
  cy.contains('a, span', buttonText).first().scrollIntoView().click();
});

When(/^User types (?!.*\band selects\b)"(.*)" in "?(.*?)(?:\.\.\.)?"$/, (text: string, textFieldLabel: string) => {
  cy.contains('label', textFieldLabel).parent().find('input, textarea').first().scrollIntoView().clear().type(text);
});

When(/^User types and selects "(.*)" in "(.*)"$/, (contactEmail: string, contactLabel: string) => {
  cy.contains('label', contactLabel).parent().find('input').first().clear().type(contactEmail);
  cy.contains('span', contactEmail).scrollIntoView().click();
});

When(/^User types and selects Secondary Tech Lead "(.*)"$/, (contactEmail: string) => {
  cy.contains('span', 'REMOVE SECONDARY TECHNICAL LEAD')
    .parent()
    .parent()
    .find('input')
    .first()
    .clear()
    .type(contactEmail);
  cy.contains('span', contactEmail).scrollIntoView().click();
});

When(/^User types justification "(.*)" in "(.*)"$/, (fieldText: string, fieldHeader) => {
  cy.contains('h3', fieldHeader).nextAll('div').first().find('input, textarea').type(fieldText);
});

When(/^User clicks button "(.*)"$/, (buttonText: string) => {
  cy.contains('a, span, button', buttonText).scrollIntoView().click();
});

When(/^User clicks modal window button "(.*)"$/, (buttonText: string) => {
  cy.get('div[aria-modal="true"]').contains('button', buttonText).scrollIntoView().click();
});

When(/^User clicks tab "(.*)"$/, (tabText: string) => {
  cy.contains('a, p', tabText).should('be.visible').scrollIntoView().click();
});

When(/^User selects "(.*)" in "(.*)"$/, (entryText: string, dropdownLabel: string) => {
  cy.contains('label', dropdownLabel).scrollIntoView().parent().find('select').select(entryText);
});

When(
  /^User selects quota "(.*)" in "(.*)" for "(.*)"$/,
  (entryText: string, dropdownLabel: string, envLabel: string) => {
    cy.contains('h3', envLabel)
      .parent()
      .find('label')
      .contains(dropdownLabel)
      .parent()
      .find('select')
      .scrollIntoView()
      .select(entryText);
  },
);

When(/^User checks checkbox "(?:\.\.\.)?(.*?)(?:\.\.\.)?"$/, (checkboxLabel: string) => {
  cy.contains('label', checkboxLabel).scrollIntoView().parent().parent().find('input').first().click();
});

When(/^User waits for "(.*)" seconds$/, (seconds: number) => {
  cy.wait(1000 * seconds);
});

When(/^User clicks span with text (.*)$/, (buttonText: string) => {
  cy.contains('span', buttonText).scrollIntoView().click();
});

When(/^User clicks button with text (.*)$/, (buttonText: string) => {
  cy.contains('button', buttonText).scrollIntoView().click();
});

When('User logs out', () => {
  cy.logoutFromRegistry();
});

Then('User should be redirected to Requests tab', () => {
  cy.contains('p', 'Products with pending requests').should('be.visible');
});

Then(/^User should see "(.*)"$/, (requestName: string) => {
  cy.contains('span', requestName).should('be.visible');
});