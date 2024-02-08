// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

function loginToRegistry(username, password) {
  cy.visit('/login', { failOnStatusCode: false });
  cy.contains('button', 'LOGIN').click();
  cy.contains('span', 'Sign in with Keycloak').click();
  cy.get('input[id="username"]').type(username);
  cy.get('input[id="password"]').type(password);
  cy.get('input[type="submit"]').click();
  cy.contains('a', 'REQUEST A NEW PRODUCT');
}

Cypress.Commands.add('loginToRegistry', (username, password) => {
  const log = Cypress.log({
    displayName: 'Login to Registry',
    message: [`🔐 Authenticating | ${username}`],
    autoEnd: false,
  });
  log.snapshot('before');

  loginToRegistry(username, password);

  log.snapshot('after');
  log.end();
});
