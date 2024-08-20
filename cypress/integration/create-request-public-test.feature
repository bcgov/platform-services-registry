Feature: New Request

  Scenario: Create Public Cloud Request and check visibility
    Given User logs in with username james.smith@gov.bc.ca and password james.smith@gov.bc.ca
    When User clicks link with text PUBLIC CLOUD LANDING ZONES
    And User clicks link with text REQUEST A NEW PRODUCT
    And User types Automated Test Product Name Public in input with name = name
    And User types Automated Test Description in textarea with id = about
    And User selects Citizens Services in dropdown with attribute id = ministry
    And User selects AWS in dropdown with attribute id = provider
    And User clicks button with text Select None
    And User checks checkbox with attribute id = test
    And User checks checkbox with attribute id = tools
    And User types and selects james.smith@gov.bc.ca in Product Owner Email
    And User types and selects john.doe@gov.bc.ca in Technical Lead Email
    And User types and selects public.admin.system@gov.bc.ca in Expense Authority Email
    And User types 77.33 in input with id = budget.test
    And User types 111.22 in input with id = budget.tools
    And User types 123 in field with label Client Code
    And User types 4A5B6 in field with label Responsibility Centre (RC)
    And User types 78901 in field with label Service Line (SL)
    And User types 2345 in field with label Standard Object of Expense (STOB)
    And User types 6789012 in field with label Project Code
    And User clicks button with text SUBMIT REQUEST
    And User checks Confirm Memorandum of Understanding
    And User checks Confirm Liable to Pay
    And User clicks button with text Submit
    And User clicks button with text Return to Dashboard
    Then User should be redirected to Requests tab
    And User should see Request with name Automated Test Product Name Public
