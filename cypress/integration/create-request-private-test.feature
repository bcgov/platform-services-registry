Feature: New Request

  Scenario: Create Private Cloud Request and check visibility
    Given User logs in with username james.smith@gov.bc.ca and password james.smith@gov.bc.ca
    When User clicks link with text PRIVATE CLOUD OPENSHIFT
    And User clicks link with text REQUEST A NEW PRODUCT
    And User types Automated Test Product Name in input with name = name
    And User types Automated Test Description in textarea with id = about
    And User selects Citizens Services in dropdown with attribute id = ministry
    And User selects SILVER in dropdown with attribute name = cluster
    And User types and selects james.smith@gov.bc.ca in Product Owner Email
    And User types and selects john.doe@gov.bc.ca in Technical Lead Email
    And User checks checkbox with attribute name = commonComponents.noServices
    And User clicks button with text SUBMIT REQUEST
    And User checks checkbox with attribute id = consent
    And User clicks button with text Submit
    And User clicks button with text Return to Dashboard
    Then User should be redirected to Requests tab
    And User should see Request with name Automated Test Product Name
