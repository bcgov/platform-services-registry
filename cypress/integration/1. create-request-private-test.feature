Feature: New Request

  Scenario: Create Private Cloud Request and check visibility
    Given User logs in with username "james.smith@gov.bc.ca" and password "james.smith@gov.bc.ca"
    When User clicks tab "PRIVATE CLOUD OPENSHIFT"
    And User clicks button "Request a new product"
    And User types "Automated Test Create Request Name" in "Product name"
    And User types "Automated Test Description" in "Description"
    And User selects "Citizens Services" in "Ministry"
    And User clicks and selects "SILVER" in "Hosting tier"
    And User clicks tab "Team members"
    And User chooses to add contact "Project Owner"
    And User types and selects email "james.smith@gov.bc.ca"
    And User chooses to add contact "Primary Technical Lead"
    And User types and selects email "john.doe@gov.bc.ca"
    And User clicks button "Submit"
    And User checks checkbox "By checking this box..."
    And User clicks modal window button "Submit"
