Feature: Edit Request
  Background:
    Given User is assigned to Existing Product

  Scenario: Create Public Cloud Edit Request and check visibility
    When User logs in as User
    And User navigates to Public Cloud tab
    And User navigates to Product Page
    And User changes Product Name
    And User changes Description
    And User selects another Ministry
    And User checks Development Account
    And User changes PO contact
    And User changes Primary TL contact
    And User adds, inputs and selects Secondary TL contact
    And User changes Expense Authority contact
    And User changes Client Code
    And User changes Responsibility Centre code
    And User changes Service Line code
    And User changes Standard Object of Expense code
    And User changes Project Code
    And User changes budget for Test
    And User changes budget for Tools
    And User changes default budget for Development
    And User clicks Submit Request
    And User inputs the Comment in All Set Popup
    And User clicks Submit Edit Request in All Set Popup
    And User clicks Return to Dashboard in Thank You Popup
    Then User should be redirected to Requests Tab
    And User should see their Request
