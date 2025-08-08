# E2E Cypress

This document outlines the structure, conventions, and usage of End-to-End (E2E) tests for Platform Services Registry Application, using **Cypress**, and the **Cucumber preprocessor** (`@badeball/cypress-cucumber-preprocessor`).

---

## Tech Stack

-   **Framework**: [Cypress](https://www.cypress.io/)
-   **Language**: TypeScript
-   **BDD Layer**: Cucumber with Gherkin syntax (`.feature` files)
-   **Plugin**: [`cypress-cucumber-preprocessor`](https://github.com/badeball/cypress-cucumber-preprocessor)

---

## How it works

-   The BDD layer consists of `.feature` files that have scenarios with human readable steps
-   Cypress cucumber preprocessor is looking for the code corresponding to human readable steps in `cypress/support/step_difnitions/common.ts` file
-   The cypress.config.ts file has `specPattern: 'cypress/**/*.feature'` set, for Cypress to look for `.feature` files instead of default `cy.js` ones
-   The code for step definitions can receive different variable data and use it in the code, e.g. button text. This allowed creating universal steps for clicking different buttons, typing in different textfields etc.

---

## Folder Structure

/cypress

├── integration/

│ &nbsp;&nbsp;&nbsp;├── 1. create-request-private-test.feature

│ &nbsp;&nbsp;&nbsp;├── 2. create-request-public-test.feature

│ &nbsp;&nbsp;&nbsp;├── 3. delete-product-private-test.feature

│ &nbsp;&nbsp;&nbsp;├── 4. approve-requests-private.feature

│ &nbsp;&nbsp;&nbsp;├── 5. approve-requests-public.feature

│ &nbsp;&nbsp;&nbsp;├── 6. delete-product-public-test.feature

│ &nbsp;&nbsp;&nbsp;├── 7. edit-request-private-test.feature

│ &nbsp;&nbsp;&nbsp;├── 8. edit-request-public-test.feature

│ &nbsp;&nbsp;&nbsp;├── 9. edit-request-private-compare-data.feature

│ &nbsp;&nbsp;&nbsp;└── 10. edit-request-public-compare-data.feature

├── support/

│ ├── step_definitions/

│&nbsp;&nbsp;│ └── common.ts

### Feature File Example

**`1. create-request-private-test.feature`**

```gherkin
Feature: New Request

  Scenario: Create Private Cloud Request and check visibility
    Given User logs in with username "james.smith@gov.bc.ca" and password "james.smith@gov.bc.ca"
    When User clicks tab "PRIVATE CLOUD OPENSHIFT"
    And User clicks button "Request a new product"
    And User types "Automated Test Create Request Name" in "Product name"
    And User types "Automated Test Description" in "Description"
    And User selects "Citizens Services" in "Ministry"
    And User clicks and selects "SILVER" in "Hosting tier"
    And User clicks tab "Team members"
    And User chooses to add contact "Project Owner"
    And User types and selects email "james.smith@gov.bc.ca"
    And User chooses to add contact "Primary Technical Lead"
    And User types and selects email "john.doe@gov.bc.ca"
    And User clicks button "Submit"
    And User checks checkbox "By checking this box..."
    And User clicks modal window button "Submit"
```

## Step Definitions

---

Common reusable steps are defined in `/cypress/support/step_definitions/common.ts`.

### Examples of Step Definitions

#### Authentication

```ts
Given(/^User logs in with username "(.*)" and password "(.*)"$/, (username, password) => {
    cy.loginToRegistry(username, password);
});
```

#### Navigation

```ts
Given('User visits main page', () => {
    cy.visit('/login', { failOnStatusCode: false });
});
```

#### Form Interactions

```ts
When(/^User types "(.*)" in "(.*)"$/, (text, label) => {
    cy.contains('label', label).siblings('input, textarea').type(text);
});
```

#### Assertion

```ts
Then(/^User should see "(.*)"$/, (text) => {
    cy.contains(text).should('be.visible');
});
```

### Debugging Steps

There's a commented-out step in `common.ts` that allows to see if a local Keycloak instance was populated with test data during Sandbox rollup:

```ts
Given('User visits local keycloak and finds james.smith', () => { ... });
```

---

## Useful Commands

---

| Step                           | Description                            |
| ------------------------------ | -------------------------------------- |
| `User logs in with username`   | Logs in using a custom Cypress command |
| `User clicks button "..."`     | Finds and clicks a button or link      |
| `User types "..." in "..."`    | Fills out a form field by label        |
| `User selects "..." in "..."`  | Selects a dropdown value               |
| `User waits for "..." seconds` | Adds an explicit wait (if needed)      |
| `User should see "..."`        | Checks for visible text                |
| `User makes a screenshot`      | Captures a visual snapshot             |
| `User reloads the page`        | Reloads current page                   |

---

## Test Coverage (Feature Files)

---

| #   | File Name                                   | Description                                           |
| --- | ------------------------------------------- | ----------------------------------------------------- |
| 1   | `create-request-private-test.feature`       | Create Private Cloud request                          |
| 2   | `create-request-public-test.feature`        | Create Public Cloud request                           |
| 3   | `delete-product-private-test.feature`       | Delete a private cloud product                        |
| 4   | `approve-requests-private.feature`          | Approve private cloud requests (Create, Edit, Delete) |
| 5   | `approve-requests-public.feature`           | Approve public cloud requests (Create, Edit, Delete)  |
| 6   | `delete-product-public-test.feature`        | Delete a public cloud product                         |
| 7   | `edit-request-private-test.feature`         | Edit private cloud request                            |
| 8   | `edit-request-public-test.feature`          | Edit public cloud request                             |
| 9   | `edit-request-private-compare-data.feature` | Validate data after edit request approved (private)   |
| 10  | `edit-request-public-compare-data.feature`  | Validate data after edit request approved (public)    |

---

## Best Practices

---

-   Reuse **step definitions** to avoid duplication.

-   Keep **scenarios short and atomic** (1 behavior = 1 scenario).

-   Use **clear and descriptive step text**.

-   Make tests **independent** (no shared state or reliance on order).

---

## Running Tests

---

You can run tests via the Cypress Test Runner (GUI) or headlessly via CLI.

### Run all tests (headless):

```bash
npx cypress run
```

### Run a specific feature file:

```bash
npx cypress run --spec "cypress/integration/1. create-request-private-test.feature"
```

### Open Cypress UI:

```bash
npx cypress open
```

---

## Adding a New Test

1.  Create a `.feature` file in `cypress/integration/`

2.  Use existing steps from `common.ts` or write new ones

3.  If new, add the step definition in `/support/step_definitions/common.ts`

4.  Validate the test by running it locally

---

## Troubleshooting

---

-   **Step not matching?** Ensure the step text in `.feature` exactly matches the regex in `common.ts`.

-   **DOM issues?** Use `.scrollIntoView()` or proper wait/assert patterns.

-   **Test not running?** Check if the file is included in your Cypress config and matches spec patterns.
