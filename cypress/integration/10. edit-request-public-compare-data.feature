Feature: Edit Request Compare Data

  Scenario: Create Public Cloud Edit Request and Compare Data
    Given User logs in with username "james.smith@gov.bc.ca" and password "james.smith@gov.bc.ca"
    And User waits for "1" seconds
    When User clicks tab "PUBLIC CLOUD LANDING ZONES"
    And User clicks button "Request a new product"
    And User types "Automated Edit Request and Compare Data Test" in "Product name"
    And User types "Automated Test to compare data Description" in "Description"
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
    And User waits for "2" seconds
    And User clicks modal window button "Close"
    Then User should be redirected to Requests tab
    And User waits for "2" seconds
    And User should see "Automated Edit Request and Compare Data Test"
    And User logs out
    And User logs in with username "michael.brown@gov.bc.ca" and password "michael.brown@gov.bc.ca"
    And User waits for "2" seconds
    When User clicks tab "PUBLIC CLOUD LANDING ZONES"
    And User waits for "2" seconds
    And User clicks tab "Requests"
    And User waits for "2" seconds
    And User clicks link "Automated Edit Request and Compare Data Test"
    And User waits for "2" seconds
    And User clicks button "Sign eMOU"
    And User types "133" in "Client Code"
    And User types "4a5b6" in "Responsibility Centre (RC)"
    And User types "78901" in "Service Line (SL)"
    And User types "2345" in "Standard Object of Expense (STOB)"
    And User types "67890cd" in "Project Code"
    And User checks checkbox "By checking this box, I confirm..."
    And User clicks modal window button "Confirm"
    And User logs out
    And User logs in with username "billing.reviewer.system@gov.bc.ca" and password "billing.reviewer.system@gov.bc.ca"
    And User waits for "2" seconds
    And User clicks tab "PUBLIC CLOUD LANDING ZONES"
    And User clicks tab "Requests"
    And User waits for "2" seconds
    And User clicks link "Automated Edit Request and Compare Data Test"
    And User waits for "2" seconds
    And User clicks button "Review eMOU"
    And User waits for "1" seconds
    And User checks checkbox "By checking this box, I confirm..."
    And User clicks modal window button "Confirm"
    And User waits for "5" seconds
    And User logs out
    And User logs in with username "public.reviewer.system@gov.bc.ca" and password "public.reviewer.system@gov.bc.ca"
    And User waits for "2" seconds
    And User clicks tab "PUBLIC CLOUD LANDING ZONES"
    And User clicks tab "Requests"
    And User waits for "2" seconds
    And User clicks link "Automated Edit Request and Compare Data Test"
    And User waits for "2" seconds
    And User clicks button "Approve"
    And User clicks modal window button "Submit"
    And User clicks modal window button "Return to Dashboard"
    And User waits for "2" seconds
    And User clicks tab "Products"
    And User waits for "3" seconds
    And User reloads the page
    Then User should see "Automated Edit Request and Compare Data Test"
    And User logs out
    And User logs in with username "james.smith@gov.bc.ca" and password "james.smith@gov.bc.ca"
    And User waits for "1" seconds
    When User clicks tab "PUBLIC CLOUD LANDING ZONES"
    And User waits for "1" seconds
    And User clicks link "Automated Edit Request and Compare Data Test"
    And User waits for "1" seconds
    And User types "Automated Test Edit Request Edited Compare Data" in "Product name"
    And User types "Automated Test to compare data Description Edit" in "Description"
    And User selects "Finance" in "Ministry"
    And User clicks and selects "Scalability needs" in "Select reason for choosing cloud provider"
    And User types "Edit reason for choosing Provider" in "Description of reason(s) for selecting cloud provider"
    And User clicks tab "Accounts to create"
    And User checks checkbox "Development account"
    And User clicks tab "Team members"
    And User chooses to edit contact "Project Owner"
    And User types and selects email "jenna.anderson@gov.bc.ca"
    And User chooses to edit contact "Primary Technical Lead"
    And User types and selects email "sarah.williams@gov.bc.ca"
    And User chooses to add contact "Secondary Technical Lead"
    And User types and selects email "kevin.taylor@gov.bc.ca"
    And User chooses to edit contact "Expense Authority"
    And User types and selects email "michael.brown@gov.bc.ca"
    And User clicks button "Add New"
    And User chooses to edit additional team member
    And User types and selects email "jessica.davis@gov.bc.ca"
    And User clicks tab "Project budget"
    And User types "55.55" in "Estimated average monthly spend - Test..."
    And User types "66.66" in "Estimated average monthly spend - Tools..."
    And User types "77.77" in "Estimated average monthly spend - Development..."
    And User clicks button "Submit"
    And User clicks modal window button "Submit"
    And User waits for "5" seconds
    And User clicks modal window button "Close"
    And User logs out
    And User logs in with username "sarah.williams@gov.bc.ca" and password "sarah.williams@gov.bc.ca"
    And User waits for "1" seconds
    When User clicks tab "PUBLIC CLOUD LANDING ZONES"
    And User waits for "1" seconds
    Then User should see "Automated Test Edit Request"
    And User clicks link "Automated Test Edit Request"
    And User waits for "1" seconds
    Then User sees "Automated Test Edit Request Edited Compare Data" in "Product name"
    And User sees "Automated Test to compare data Description Edit" in "Description"
    And User checks that select "Ministry" value is "FIN"
    And User checks that select "Cloud Service Provider" value is "AWS_LZA"
    And User confirms multiselect "Select reason for choosing cloud provider" has value "Cost efficiency"
    And User confirms multiselect "Select reason for choosing cloud provider" has value "Scalability needs"
    And User sees "Edit reason for choosing Provider" in "Description of reason(s) for selecting cloud provider"
    And User clicks tab "Accounts to create"
    And User confirms checkbox "Test account" is checked
    And User confirms checkbox "Tools account" is checked
    And User confirms checkbox "Development account" is checked
    And User clicks tab "Team members"
    And User checks "Project Owner" is set to "jenna.anderson@gov.bc.ca"
    And User checks "Primary Technical Lead" is set to "sarah.williams@gov.bc.ca"
    And User checks "Secondary Technical Lead" is set to "kevin.taylor@gov.bc.ca"
    And User confirms Additional team members is set to "jessica.davis@gov.bc.ca"
    And User clicks tab "Project budget"
    And User sees "77.77" in "Estimated average monthly spend - Development account"
    And User sees "55.55" in "Estimated average monthly spend - Test account"
    And User sees "66.66" in "Estimated average monthly spend - Tools account"
