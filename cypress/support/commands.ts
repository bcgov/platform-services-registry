/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

declare global {
  module Cypress {
    interface Chainable<Subject = any> {
      loginToRegistry(user: string, pass: string): void;
      loginToRegistryThroughApi(user: string, pass: string): void;
      logoutFromRegistry(): void;
    }
  }
}

export function loginToRegistry(username: string, password: string): void {
  cy.visit('/login', { failOnStatusCode: false });
  cy.wait(2000);
  cy.contains('button', 'Login').click();
  cy.wait(5000); // wait until the page loads, otherwise no chances to find clause below
  cy.url().then((val) => {
    if (val.includes('/api/auth/signin?csrf=true')) {
      cy.contains('span', 'Sign in with Keycloak').click();
      cy.wait(2000);
    }
  });
  cy.origin(
    Cypress.env('keycloakUrl'),
    { args: { usernameOrig: username, passwordOrig: password } },
    ({ usernameOrig, passwordOrig }) => {
      cy.get('input[id="username"]').type(usernameOrig);
      cy.get('input[id="password"]').type(passwordOrig);
      cy.get('input[type="submit"]').click();
    },
  );

  cy.contains('a', 'PRIVATE CLOUD OPENSHIFT');
  cy.contains('a', 'PUBLIC CLOUD LANDING ZONES');
}

export function logoutFromRegistry(): void {
  cy.get('button[aria-haspopup="menu"]').click();
  cy.contains('div', 'Sign Out').click();
  cy.contains('button', 'Login').should('be.visible');
}

Cypress.Commands.add('loginToRegistry', (username: string, password: string) => {
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

Cypress.Commands.add('logoutFromRegistry', () => {
  logoutFromRegistry();
});
