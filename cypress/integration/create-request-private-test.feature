Feature: New Request

  Scenario: Create Private Cloud Request and check visibility
    When User logs in as User
    And User navigates to Private Cloud tab
    And User clicks Request a New Product
    And User inputs Product Name
    And User inputs Description
    And User selects Ministry
    And User selects Hosting Tier
    And User inputs and selects PO contact
    And User inputs and selects Primary TL contact
    And User checks Does not Use Common Components
    And User clicks Submit Request
    And User checks Confirm in All Set Popup
    And User clicks Submit Request in All Set Popup
    And User clicks Return to Dashboard in Thank You Popup
    Then User should be redirected to Requests tab
    And User should see their Request
