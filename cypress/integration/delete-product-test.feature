Feature: Delete Request
  Background:
    Given User assigned to an existing Product

  Scenario: Delete Request and check visibility
    When User logs in as User
    And User navigates to Private Cloud tab
    And User navigates to Existing Product Page
    And User clicks Delete button
    And User inputs Licence Plate Number in Confirmation Popup
    And User inputs Product Owner Email in Confirmation Popup
    And User clicks Delete in Confirmation Popup
    And User clicks Return to Dashboard in Thank You Popup
    Then User should be redirected to Requests Tab
    And User should see their Request
