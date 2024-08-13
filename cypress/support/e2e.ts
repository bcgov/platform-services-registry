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
Cypress.on('uncaught:exception', (err: Error) => {
  // List of specific error messages to ignore
  const ignoreMessages = [
    'Hydration failed because the initial UI does not match what was rendered on the server.',
    'Hydration failed because the initial UI does not match what was rendered on the server. See more info here: https://nextjs.org/docs/messages/react-hydration-error',
    'There was an error while hydrating. Because the error happened outside of a Suspense boundary, the entire root will switch to client rendering.',
  ];

  // Check if the error message is one of the ones to ignore
  if (ignoreMessages.some((message) => err.message.includes(message))) {
    // Returning false prevents Cypress from failing the test
    return false;
  }

  // Returning true allows Cypress to handle other exceptions normally
  return true;
});
