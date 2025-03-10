Feature: New Request

  Scenario: Create Public Cloud Request and check visibility
    Given User logs in with username "james.smith@gov.bc.ca" and password "james.smith@gov.bc.ca"
    And User waits for "3" seconds
    When User clicks tab "PUBLIC CLOUD LANDING ZONES"
    And User clicks button "Request a new product"
    And User types "Automated Test Product Name" in "Product name"
    And User types "Automated Test Description" in "Description"
    And User selects "Citizens Services" in "Ministry"
    And User selects "AWS" in "Cloud Service Provider"
    And User clicks and selects "Cost efficiency" in "Select reason for choosing cloud provider"
    And User types "Test reason for choosing Cl. Prov." in "Description of reason(s) for selecting cloud provider"
    And User clicks tab "Accounts to create"
    And User clicks button "Select None"
    And User checks checkbox "Test account"
    And User checks checkbox "Tools account"
    And User clicks tab "Team contacts"
    And User types and selects "james.smith@gov.bc.ca" in "Project Owner"
    And User waits for "2" seconds
    And User types and selects "john.doe@gov.bc.ca" in "Primary Technical Lead"
    And User clicks tab "Expense authority"
    And User types and selects "public.admin.system@gov.bc.ca" in "Expense Authority email"
    And User clicks tab "Project budget"
    And User types "77.33" in "Estimated average monthly spend - Test..."
    And User types "111.22" in "Estimated average monthly spend - Tool..."
    And User clicks tab "Billing (account coding)"
    And User types "123" in "Client Code"
    And User types "4A5B6" in "Responsibility Centre (RC)"
    And User types "78901" in "Service Line (SL)"
    And User types "2345" in "Standard Object of Expense (STOB)"
    And User types "6789012" in "Project Code"
    And User clicks button "Submit"
    And User checks checkbox "No eMOU exists for this account coding."
    And User checks checkbox "...team is liable to pay the base charge..."
    And User clicks modal window button "Submit"
    And User waits for "4" seconds
    And User clicks modal window button "Close"
    Then User should be redirected to Requests tab
    And User should see "Automated Test Product Name"
    And User logs out
