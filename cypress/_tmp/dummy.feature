# Feature: Dummy Feature
#   Scenario: Let pipeline run without reds while adjusting the tests to GHA environment
#     Given User visits local keycloak and finds james.smith
#     And User logs in with username "james.smith@gov.bc.ca" and password "james.smith@gov.bc.ca"
#     When User clicks tab "PRIVATE CLOUD OPENSHIFT"
#     And User clicks button "REQUEST A NEW PRODUCT"
#     And User types "Automated Test Product Name" in "Product Name"
#     And User types "Automated Test Description" in "Description"
#     And User selects "Citizens Services" in "Ministry"
#     And User selects "SILVER" in "Hosting Tier"
#     And User clicks tab "Team contacts"
#     And User types and selects "james.smith@gov.bc.ca" in "Product Owner Email"
#     And User types and selects "john.doe@gov.bc.ca" in "Technical Lead Email"
#     And User clicks button "SUBMIT REQUEST"
#     And User checks checkbox "By checking this box..."
#     And User clicks button "Submit"
#     And User clicks button "Return to Dashboard"
#     Then User should be redirected to Requests tab
#     And User should see "Automated Test Product Name"
