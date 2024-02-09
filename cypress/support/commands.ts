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
      loginToRegistry(username: string, password: string): void;
    }
  }
}

export function loginToRegistry(username: string, password: string): void {
  cy.visit('/login', { failOnStatusCode: false });
  cy.contains('button', 'LOGIN').click();
  cy.contains('span', 'Sign in with Keycloak').click();
  cy.get('input[id="username"]').type(username);
  cy.get('input[id="password"]').type(password);
  cy.get('input[type="submit"]').click();
  cy.contains('a', 'REQUEST A NEW PRODUCT');
}

Cypress.Commands.add('loginToRegistry' as any, (username: any, password: any) => {
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
