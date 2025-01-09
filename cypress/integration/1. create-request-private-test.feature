Feature: New Request

  Scenario: Create Private Cloud Request and check visibility
    Given User logs in with username "james.smith@gov.bc.ca" and password "james.smith@gov.bc.ca"
    When User clicks tab "PRIVATE CLOUD OPENSHIFT"
    And User clicks button "Request a new product"
    And User types "Automated Test Product Name" in "Product name"
    And User types "Automated Test Description" in "Description"
    And User selects "Citizens Services" in "Ministry"
    And User clicks and selects "SILVER" in "Hosting tier"
    And User clicks tab "Team contacts"
    And User types and selects "james.smith@gov.bc.ca" in "Product Owner email"
    And User waits for "2" seconds
    And User types and selects "john.doe@gov.bc.ca" in "Technical Lead email"
    And User clicks tab "Common components"
    And User checks checkbox "The app does not use..."
    And User makes a screenshot
    And User clicks button "Submit"
    And User checks checkbox "By checking this box..."
    And User clicks modal window button "Submit"
    And User clicks modal window button "Close"
    Then User should be redirected to Requests tab
    And User should see "Automated Test Product Name"
