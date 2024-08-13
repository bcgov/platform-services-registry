import { When, Then, Given } from '@badeball/cypress-cucumber-preprocessor';

Given(/^User logs in with username (.*) and password (.*)$/, (username: string, password: string) => {
  cy.loginToRegistry(username, password);
});

When(/^User clicks link with text (.*)$/, (buttonText: string) => {
  cy.contains('a', buttonText).click();
});

When(
  /^User types (.*) in (.*) with (.*) = (.*)$/,
  (text: string, elementType: string, attribute: string, attributeValue: string) => {
    cy.get(`${elementType}[${attribute}='${attributeValue}']`).type(text);
  },
);

When(
  /^User selects (.*) in dropdown with attribute (.*) = (.*)$/,
  (optionText: string, attribute: string, attributeValue: string) => {
    cy.get(`select[${attribute}='${attributeValue}']`).select(optionText);
  },
);

When(/^User types and selects (.*) in (.*)$/, (contactEmail: string, label: string) => {
  cy.contains('label', label).parent().find('input').first().type(contactEmail);
  cy.contains('span', contactEmail).click();
});

When(/^User checks checkbox with attribute (.*) = (.*)$/, (attribute: string, attributeValue: string) => {
  cy.get(`input[${attribute}="${attributeValue}"]`).click();
});

When(/^User waits for (.*) seconds$/, (seconds: number) => {
  cy.wait(1000 * seconds);
});

When(/^User types (.*) in field with label (.*)$/, (text: string, fieldLabel: string) => {
  cy.contains('label', fieldLabel).parent().find('input').first().type(text);
});

Then('User should be redirected to Requests tab', () => {
  cy.contains('p', 'Products with pending requests').should('be.visible');
});

Then(/^User should see Request with name (.*)$/, (requestName: string) => {
  cy.contains('span', requestName).should('be.visible');
});
