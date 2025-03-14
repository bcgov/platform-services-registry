Feature: Edit Request

  Scenario: Create Private Cloud Edit Request and check visibility
    Given User logs in with username "james.smith@gov.bc.ca" and password "james.smith@gov.bc.ca"
    When User clicks tab "PRIVATE CLOUD OPENSHIFT"
    And User clicks button "Request a new product"
    And User types "Automated Test Product Name" in "Product name"
    And User types "Automated Test Description" in "Description"
    And User selects "Citizens Services" in "Ministry"
    And User clicks and selects "SILVER" in "Hosting tier"
    And User clicks tab "Team contacts"
    And User types and selects "james.smith@gov.bc.ca" in "Project Owner"
    And User waits for "2" seconds
    And User types and selects "john.doe@gov.bc.ca" in "Primary Technical Lead"
    And User makes a screenshot
    And User clicks button "Submit"
    And User checks checkbox "By checking this box..."
    And User clicks modal window button "Submit"
    And User clicks modal window button "Close"
    Then User should be redirected to Requests tab
    And User should see "Automated Test Product Name"
    And User logs out
    And User logs in with username "private.reviewer.system@gov.bc.ca" and password "private.reviewer.system@gov.bc.ca"
    And User clicks tab "PRIVATE CLOUD OPENSHIFT"
    And User waits for "3" seconds
    And User clicks tab "Requests"
    And User waits for "3" seconds
    And User clicks link "Automated Test Product Name"
    And User clicks button "Approve"
    And User clicks modal window button "Submit"
    And User clicks modal window button "Return to Dashboard"
    And User logs out
    And User logs in with username "james.smith@gov.bc.ca" and password "james.smith@gov.bc.ca"
    And User clicks tab "PRIVATE CLOUD OPENSHIFT"
    When User clicks link "Automated Test Product Name"
    And User waits for "10" seconds
    And User types "Automated Test Edit Request" in "Product name"
    And User types "Automated Test Description Edit" in "Description"
    And User selects "Finance" in "Ministry"
    And User clicks tab "Team contacts"
    And User changes "Project Owner" to "david.johnson@gov.bc.ca"
    And User waits for "2" seconds
    And User changes "Primary Technical Lead" to "sarah.williams@gov.bc.ca"
    And User types and selects "michael.brown@gov.bc.ca" in "Secondary Technical Lead"
    And User clicks tab "Quotas"
    And User types quota "1" in "CPU" for "Development"
    And User types quota "3" in "MEMORY" for "Development"
    And User types quota "2" in "STORAGE" for "Development"
    And User types quota "1" in "CPU" for "Test"
    And User types quota "3" in "MEMORY" for "Test"
    And User types quota "2" in "STORAGE" for "Test"
    And User types quota "1" in "CPU" for "Production"
    And User types quota "3" in "MEMORY" for "Production"
    And User types quota "2" in "STORAGE" for "Production"
    And User types quota "1" in "CPU" for "Tools"
    And User types quota "3" in "MEMORY" for "Tools"
    And User types quota "2" in "STORAGE" for "Tools"
    And User types justification "John Cypress" in "Contact name"
    And User types justification "testemail@artemtest.com" in "Contact email"
    And User types justification "Test Justification text, test-test, 123" in "Justification of quota increase"
    And User clicks button "Submit"
    And User clicks modal window button "Submit"
    And User clicks modal window button "Close"
    And User waits for "5" seconds
    Then User should be redirected to Requests tab
    And User should see "Automated Test Edit Request"
