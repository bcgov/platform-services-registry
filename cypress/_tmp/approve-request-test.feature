Feature: Request Review
  Background:
    Given Present request with name "Automated Test Product Name" and contacts "james.smith@gov.bc.ca" and "john.doe@gov.bc.ca"
    And User logs in with username "james.smith@gov.bc.ca" and password "james.smith@gov.bc.ca"
    And User clicks tab "PRIVATE CLOUD OPENSHIFT"
    And User clicks tab "Requests"

Scenario: Approval Admin reviews New Request
    When User clicks link "Automated Test Product Name"
    And User clicks button "APPROVE REQUEST"
    And User clicks button "CONFIRM APPROVAL"
    And User clicks button "Return to Dashboard"
    And User clicks link "Products"
    Then User should see "Automated Test Product Name"

Scenario: Approval Admin reviews Edit Request
    When User clicks link "Automated Test Product Name"
    And User clicks button "APPROVE REQUEST"
    And User clicks button "CONFIRM APPROVAL"
    And User clicks button "Return to Dashboard"
    And User clicks link "Products"
    Then User should see "Automated Test Product Name"

Scenario: Approval Admin reviews Delete Request
    When User clicks link "Automated Test Product Name"
    And User clicks button "APPROVE REQUEST"
    And User clicks button "CONFIRM APPROVAL"
    And User clicks button "Return to Dashboard"
    And User clicks link "Products"
    Then User should see "Automated Test Product Name"
