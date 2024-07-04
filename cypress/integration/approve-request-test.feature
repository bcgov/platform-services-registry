Feature: Request Review
  Background:
    Given There is a request waiting for Review

Scenario: Approval Admin reviews New Request
    When User logs in as Approval Admin
    And User navigates to Private Cloud tab
    And User navigates to Request Decision Page
    And User clicks Approve Request button
    And User clicks Confirm Approval in Confirmation Popup
    And User clicks Return to Dashboard in Decision Shared Popup
    And User navigates to Products Tab
    Then User should see the Product

Scenario: Approval Admin reviews Edit Request
    When User logs in as Approval Admin
    And User navigates to Private Cloud tab
    And User navigates to Request Decision Page
    And User clicks Approve Request button
    And User clicks Confirm Approval in Confirmation Popup
    And User clicks Return to Dashboard in Decision Shared Popup
    And User navigates to Products Tab
    And User navigates to Product Page
    Then Product values should be changed

Scenario: Approval Admin reviews Delete Request
    When User logs in as Approval Admin
    And User navigates to Private Cloud tab
    And User navigates to Request Decision Page
    And User clicks Approve Request button
    And User clicks Confirm Approval in Confirmation Popup
    And User clicks Return to Dashboard in Decision Shared Popup
    And User navigates to Products Tab
    Then User should not see the Product
