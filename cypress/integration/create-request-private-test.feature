Feature: New Request

  Scenario: Create Private Cloud Request and check visibility
    Given User logs in with username james.smith@gov.bc.ca and password james.smith@gov.bc.ca
    When User clicks link with text PRIVATE CLOUD OPENSHIFT
    And User clicks link with text REQUEST A NEW PRODUCT
    And User types Automated Test Product Name in input with name = name
    And User types Automated Test Description in textarea with id = about
    And User selects Citizens Services in dropdown with attribute id = ministry
    And User selects SILVER in dropdown with attribute name = cluster
    And User inputs and selects james.smith@gov.bc.ca in Product Owner Email
    And User inputs and selects john.doe@gov.bc.ca in Technical Lead Email
    And User checks Does not Use Common Components
    And User clicks Submit Request
    And User checks Confirm in All Set Popup
    And User clicks Submit Request in All Set Popup
    And User clicks Return to Dashboard in Thank You Popup
    Then User should be redirected to Requests tab
    And User should see their Request
