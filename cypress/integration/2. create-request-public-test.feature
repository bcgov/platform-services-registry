Feature: New Request

  Scenario: Create Public Cloud Request and check visibility
    Given User logs in with username "james.smith@gov.bc.ca" and password "james.smith@gov.bc.ca"
    And User waits for "3" seconds
    When User clicks tab "PUBLIC CLOUD LANDING ZONES"
    And User clicks button "Request a new product"
    And User types "Automated Create Request Test Name" in "Product name"
    And User types "Automated Test Description" in "Description"
    And User selects "Citizens Services" in "Ministry"
    And User selects "AWS LZA" in "Cloud Service Provider"
    And User clicks and selects "Cost efficiency" in "Select reason for choosing cloud provider"
    And User types "Test reason for choosing Cl. Prov." in "Description of reason(s) for selecting cloud provider"
    And User clicks tab "Accounts to create"
    And User clicks button "Select None"
    And User checks checkbox "Test account"
    And User checks checkbox "Tools account"
    And User clicks tab "Team members"
    And User chooses to add contact "Project Owner"
    And User types and selects email "james.smith@gov.bc.ca"
    And User chooses to add contact "Primary Technical Lead"
    And User types and selects email "john.doe@gov.bc.ca"
    And User chooses to add contact "Expense Authority"
    And User types and selects email "michael.brown@gov.bc.ca"
    And User clicks tab "Project budget"
    And User types "77.33" in "Estimated average monthly spend - Test..."
    And User types "111.22" in "Estimated average monthly spend - Tool..."
    And User clicks button "Submit"
    And User checks checkbox "...an email to the EA for their signature..."
    And User checks checkbox "...team is liable to pay the base charge..."
    And User clicks modal window button "Submit"
    And User waits for "4" seconds
    And User clicks modal window button "Close"
    Then User should be redirected to Requests tab
    And User should see "Automated Create Request Test Name"
    And User logs out
