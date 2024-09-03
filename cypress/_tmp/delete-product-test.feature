Feature: Delete Request
  Background:
    Given Present request with name "Automated Test Product Name" and contacts "james.smith@gov.bc.ca" and "john.doe@gov.bc.ca"
    And User logs in with username "james.smith@gov.bc.ca" and password "james.smith@gov.bc.ca"
    And User clicks tab "PRIVATE CLOUD OPENSHIFT"

  Scenario: Delete Request and check visibility
    When User clicks link "Automated Test Product Name"
    And User copies Licence Plate
    And User clicks button "Options"
    And User clicks button "Delete"
    And User pastes "Licence Plate"
    And User types "james.smith@gov.bc.ca" in "Product Owner Email"
    And User clicks button "Delete"
    And User clicks button "Return to Dashboard"
    And User clicks link "Requests"
    And User should see "Automated Test Edit Request"
