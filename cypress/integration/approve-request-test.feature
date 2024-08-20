Feature: Request Review
  Background:
    Given There is a request with names james.smith@gov.bc.ca and john.doe@gov.bc.ca waiting for Review
    And User logs in with username private.admin.system@gov.bc.ca and password private.admin.system@gov.bc.ca
    And User clicks link with text PRIVATE CLOUD OPENSHIFT

Scenario: Approval Admin reviews New Request
    When User navigates to Request Decision Page
    And User clicks Approve Request button
    And User clicks button with text CONFIRM APPROVAL
    And User clicks button with text Return to Dashboard
    And User clicks link with text Products
    Then User should see the Product

Scenario: Approval Admin reviews Edit Request
    When User navigates to Request Decision Page
    And User clicks Approve Request button
    And User clicks button with text CONFIRM APPROVAL
    And User clicks button with text Return to Dashboard
    And User clicks link with text Products
    Then User should see the Product

Scenario: Approval Admin reviews Delete Request
    When User navigates to Request Decision Page
    And User clicks Approve Request button
    And User clicks button with text CONFIRM APPROVAL
    And User clicks button with text Return to Dashboard
    And User clicks link with text Products
    Then User should not see the Product
