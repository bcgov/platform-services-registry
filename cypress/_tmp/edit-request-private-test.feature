Feature: Edit Request

  Scenario: Create Private Cloud Edit Request and check visibility
    Given User logs in with username "james.smith@gov.bc.ca" and password "james.smith@gov.bc.ca"
    And User clicks tab "PRIVATE CLOUD OPENSHIFT"
    And Request exists with name "Automated Test Product Name" and contacts "james.smith@gov.bc.ca" and "john.doe@gov.bc.ca"
    And User logs out
    And User logs in with username "admin.system@gov.bc.ca" and password "admin.system@gov.bc.ca"
    And User clicks tab "PRIVATE CLOUD OPENSHIFT"
    And User waits for "3" seconds
    And User clicks tab "Requests"
    And User waits for "3" seconds
    And User clicks link "Automated Test Product Name"
    And User clicks button "APPROVE REQUEST"
    And User clicks button "CONFIRM APPROVAL"
    And User clicks button "Return to Dashboard"
    And User logs out
    And User logs in with username "james.smith@gov.bc.ca" and password "james.smith@gov.bc.ca"
    And User clicks tab "PRIVATE CLOUD OPENSHIFT"
    And User clicks tab "PRIVATE CLOUD OPENSHIFT"
    When User clicks link "Automated Test Product Name"
    And User waits for "3" seconds
    And User types "Automated Test Edit Request" in "Product Name"
    And User types "Automated Test Description Edit" in "Description"
    And User selects "Finance" in "Ministry"
    And User clicks tab "Team contacts"
    And User types and selects "david.johnson@gov.bc.ca" in "Product Owner Email"
    And User waits for "2" seconds
    And User types and selects "sarah.williams@gov.bc.ca" in "Technical Lead Email"
    And User clicks button "ADD SECONDARY TECHNICAL LEAD"
    And User types and selects Secondary Tech Lead "michael.brown@gov.bc.ca"
    And User clicks tab "Quotas"
    And User selects quota "4 CPU Request, 8 CPU Limit" in "CPU" for "Production"
    And User selects quota "4 GB Request, 8 GB Limit" in "MEMORY" for "Production"
    And User selects quota "4 GB" in "STORAGE" for "Production"
    And User selects quota "4 CPU Request, 8 CPU Limit" in "CPU" for "Test"
    And User selects quota "4 GB Request, 8 GB Limit" in "MEMORY" for "Test"
    And User selects quota "4 GB" in "STORAGE" for "Test"
    And User selects quota "4 CPU Request, 8 CPU Limit" in "CPU" for "Tools"
    And User selects quota "4 GB Request, 8 GB Limit" in "MEMORY" for "Tools"
    And User selects quota "4 GB" in "STORAGE" for "Tools"
    And User selects quota "4 CPU Request, 8 CPU Limit" in "CPU" for "Development"
    And User selects quota "4 GB Request, 8 GB Limit" in "MEMORY" for "Development"
    And User selects quota "4 GB" in "STORAGE" for "Development"
    And User types justification "John Cypress" in "Contact name"
    And User types justification "testemail@artemtest.com" in "Contact email"
    And User types justification "Test Justification text, test-test, 123" in "Justification of quota request"
    And User clicks tab "Common components"
    And User checks checkbox "Address and Geolocation"
    And User checks checkbox "Form Design and Submission..."
    And User checks checkbox "Publishing..."
    And User clicks button "SUBMIT EDIT REQUEST"
    And User clicks button "Submit"
    And User clicks button "Return to Dashboard"
    And User waits for "5" seconds
    Then User should be redirected to Requests tab
    And User should see "Automated Test Edit Request"
