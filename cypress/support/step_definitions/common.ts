import { When, Then, Given } from '@badeball/cypress-cucumber-preprocessor';

Given(/^User logs in with username "(.*)" and password "(.*)"$/, (username: string, password: string) => {
  cy.loginToRegistry(username, password);
});

Given('User visits main page', () => {
  cy.visit('/login', { failOnStatusCode: false });
});

// Step for debug
// Given('User visits local keycloak and finds james.smith', () => {
//   cy.wait(300);
//   cy.visit('http://localhost:8080');
//   cy.contains('a', 'Administration Console').click();
//   cy.get('input[id="username"]').type('admin');
//   cy.get('input[id="password"]').type('password');
//   cy.get('input[type="submit"]').click();
//   cy.get('button[id="nav-toggle"]').click();
//   cy.get('button[data-testid="realmSelectorToggle"]').click();
//   cy.screenshot();
//   cy.contains('div', 'platform-services').should('be.visible').click();
//   cy.get('a[id="nav-item-users"]').click();
//   cy.wait(3);
//   cy.contains('td', 'james.smith@gov.bc.ca').should('be.visible');
//   cy.visit('http://localhost:3000/login');
//   cy.wait(5);
//   cy.screenshot();
// });

When(/^User clicks link "(.*)"$/, (linkText: string) => {
  cy.contains('a, span', linkText).first().scrollIntoView().click();
});

When(/^User types (?!.*\band selects\b)"(.*)" in "?(.*?)(?:\.\.\.)?"$/, (text: string, textFieldLabel: string) => {
  cy.contains('label', textFieldLabel)
    .closest('.text-input, .textarea, .dollar-input')
    .find('input, textarea')
    .scrollIntoView()
    .clear()
    .type(text);
});

When(/^User types and selects "(.*)" in "(.*)"$/, (contactEmail: string, contactLabel: string) => {
  cy.contains('td', contactLabel).parent().find('button').first().click();
  cy.get('input[placeholder="Enter email..."]').click().clear().type(contactEmail);
  cy.contains('p', contactEmail).scrollIntoView().click();
  cy.contains('button', 'Select').click();
});

When(/^User changes "(.*)" to "(.*)"$/, (contactLabel: string, contactEmail: string) => {
  cy.contains('td', contactLabel).scrollIntoView().parent().find('td').eq(1).click();
  cy.get('input[placeholder="Enter email..."]').click().clear().type(contactEmail);
  cy.contains('p', contactEmail).scrollIntoView().click();
  cy.contains('button', 'Select').click();
});

When(/^User types justification "(.*)" in "(.*)"$/, (fieldText: string, fieldHeader) => {
  cy.contains('h3', fieldHeader).nextAll('div').first().find('input, textarea').type(fieldText);
});

When(/^User clicks button "(.*)"$/, (buttonText: string) => {
  cy.contains('a, span, button', buttonText).scrollIntoView().click();
});

When(/^User clicks modal window button "(.*)"$/, (buttonText: string) => {
  cy.get('div[aria-modal="true"], section[role="dialog"]').contains('button', buttonText).scrollIntoView().click();
});

When(/^User clicks tab "(.*)"$/, (tabText: string) => {
  cy.contains('a, p', tabText).should('be.visible').scrollIntoView().click();
});

When(/^User clicks and selects "(.*)" in "(.*)"$/, (menuOption: string, menuName: string) => {
  cy.contains('label', menuName).closest('.select-single, .multi-select').find('input').first().click();
  cy.contains('span', menuOption).click();
});

When(/^User selects "(.*)" in "(.*)"$/, (entryText: string, dropdownLabel: string) => {
  cy.contains('label', dropdownLabel).scrollIntoView().parent().find('input, select').select(entryText);
});

When(/^User types quota "(.*)" in "(.*)" for "(.*)"$/, (value: string, resourceType: string, envLabel: string) => {
  cy.contains('h3', envLabel)
    .parent()
    .find('label')
    .contains(resourceType)
    .closest('.text-input')
    .find('input')
    .scrollIntoView()
    .clear()
    .type(value);
});

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

When('User makes a screenshot', () => {
  cy.screenshot();
});

When(/^User sees "(.*)" in "?(.*?)(?:\.\.\.)?"$/, (text: string, textFieldLabel: string) => {
  cy.contains('label', textFieldLabel)
    .parents()
    .eq(2)
    .find('input, textarea, select')
    .first()
    .scrollIntoView()
    .should('have.value', text);
});

When(/^User copies value of "(.*)"$/, (elementLabel: string) => {
  cy.get('section[role="dialog"]').then(($modal) => {
    if ($modal.length) {
      cy.get('div[aria-modal="true"], section[role="dialog"]')
        .contains('p', elementLabel)
        .parent()
        .find('p')
        .last()
        .then((element) => {
          const copiedText = element.text();
          cy.wrap(copiedText).as('copiedText');
        });
    } else {
      cy.contains('p', elementLabel)
        .parent()
        .find('p')
        .last()
        .then((element) => {
          const copiedText = element.text();
          cy.wrap(copiedText).as('copiedText');
        });
    }
  });
});

When(/^User pastes from clipboard to "?(.*?)(?:\.\.\.)?"$/, (textfieldLabel) => {
  cy.get('@copiedText').then((copiedText) => {
    cy.get(`input[placeholder="${textfieldLabel}"]`).click().invoke('val', copiedText);
  });
});

When('User reloads the page', () => {
  cy.reload();
});

Then('User should be redirected to Requests tab', () => {
  cy.contains('p', 'These requests are currently under admin review.').should('be.visible');
});

Then(/^User should see "(.*)"$/, (requestName: string) => {
  cy.contains('span', requestName).should('be.visible');
});

Then(/^User should not see "(.*)"$/, (productName: string) => {
  cy.contains('span', productName).should('not.exist');
});

Then(/^User should see badge "(.*)"$/, (badgeText: string) => {
  cy.contains('span', badgeText).should('be.visible');
});
