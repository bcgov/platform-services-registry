Feature: New Request

  Scenario: Create Public Cloud Request and check visibility
    When User logs in as User
    And User navigates to Public Cloud tab
    And User clicks Request a New Product
    And User inputs Product Name
    And User inputs Description
    And User selects Ministry
    And User inputs Cloud Service Provider
    And User clicks Select None button
    And User checks Test Account
    And User checks Tools Account
    And User inputs and selects PO contact
    And User inputs and selects Primary TL contact
    And User inputs Expense Authority contact
    And User inputs Client Code
    And User inputs Responsibility Centre code
    And User inputs Service Line code
    And User inputs Standard Object of Expense code
    And User inputs Project Code
    And User changes default budget for Test
    And User clicks Submit Request
    And User checks Confirm Memorandum of Understanding
    And User checks Confirm Liable to Pay
    And User clicks Submit Request in All Set Popup
    And User clicks Return to Dashboard in Thank You Popup
    Then User should be redirected to Requests tab
    And User should see their Request
