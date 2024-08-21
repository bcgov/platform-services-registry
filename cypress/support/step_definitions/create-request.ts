import { When, Then, Given } from '@badeball/cypress-cucumber-preprocessor';

Given(/^User logs in with username "?([^"]*)"? and password "?([^"]*)"?$/, (username: string, password: string) => {
  cy.loginToRegistry(username, password);
});

When(/^User clicks link with text "?([^"]*)"?$/, (buttonText: string) => {
  cy.contains('a', buttonText).click();
});

When(
  /^User types (?!.*\band selects\b)"?([^"]*)"? in "?([^"]*?)(?:\.\.\.)?"$/,
  (text: string, textFieldLabel: string) => {
    cy.contains('label', textFieldLabel).parent().find('input, textarea').first().type(text);
  },
);

When(/^User clicks button "?([^"]*)"?$/, (buttonText: string) => {
  cy.contains('a, span, button', buttonText).click();
});

When(/^User clicks modal window button "?([^"]*)"?$/, (buttonText: string) => {
  cy.get('div[aria-modal="true"]').find('button').contains(buttonText).click();
});

When(/^User clicks tab "?([^"]*)"?$/, (tabText: string) => {
  cy.contains('a', tabText).click();
});

When(/^User selects "?([^"]*)"? in "?([^"]*)"?$/, (entryText: string, dropdownLabel: string) => {
  cy.contains('label', dropdownLabel).parent().find('select').select(entryText);
});

When(/^User types and selects "?([^"]*)"? in "?([^"]*)"?$/, (contactEmail: string, contactLabel: string) => {
  cy.contains('label', contactLabel).parent().find('input').first().type(contactEmail);
  cy.contains('span', contactEmail).click();
});

When(/^User checks checkbox "?([^"]*?)(?:\.\.\.)?"$/, (checkboxLabel: string) => {
  cy.contains('label', checkboxLabel).parent().parent().find('input').first().click();
});

When(/^User waits for "?([^"]*)"? seconds$/, (seconds: number) => {
  cy.wait(1000 * seconds);
});

Then('User should be redirected to Requests tab', () => {
  cy.contains('p', 'Products with pending requests').should('be.visible');
});

Then(/^User should see Request with name "?([^"]*)"?$/, (requestName: string) => {
  cy.contains('span', requestName).should('be.visible');
});
