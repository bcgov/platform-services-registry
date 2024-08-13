Feature: Edit Request
  Background:
    Given User is assigned to Existing Product

  Scenario: Create Private Cloud Edit Request and check visibility
    Given User logs in with username james.smith@gov.bc.ca and password james.smith@gov.bc.ca
    When User clicks link with text PRIVATE CLOUD OPENSHIFT
    And User clicks link with text REQUEST A NEW PRODUCT
    And User clicks Request with Automated Test Product Name
    And User types Automated Test Edit Request in input with name = name
    And User types Automated Test Description Edit in textarea with id = about
    And User selects Finance in dropdown with attribute id = ministry
    And User types and selects david.johnson@gov.bc.ca in Product Owner Email
    And User types and selects sarah.williams@gov.bc.ca in Technical Lead Email
    And User clicks span with text ADD SECONDARY TECHNICAL LEAD
    And User types and selects michael.brown@gov.bc.ca in Secondary Technical Lead Email
    And User selects 4 CPU Request, 8 CPU Limit in dropdown with attribute id = cpuproduction
    And User selects 4 CPU Request, 8 CPU Limit in dropdown with attribute id = memoryproduction
    And User selects 4 CPU Request, 8 CPU Limit in dropdown with attribute id = storageproduction
    And User selects 4 CPU Request, 8 CPU Limit in dropdown with attribute id = cputest
    And User selects 4 CPU Request, 8 CPU Limit in dropdown with attribute id = memorytest
    And User selects 4 CPU Request, 8 CPU Limit in dropdown with attribute id = storagetest
    And User selects 4 CPU Request, 8 CPU Limit in dropdown with attribute id = cputools
    And User selects 4 CPU Request, 8 CPU Limit in dropdown with attribute id = memorytools
    And User selects 4 CPU Request, 8 CPU Limit in dropdown with attribute id = storagetools
    And User selects 4 CPU Request, 8 CPU Limit in dropdown with attribute id = cpudevelopment
    And User selects 4 CPU Request, 8 CPU Limit in dropdown with attribute id = memorydevelopment
    And User selects 4 CPU Request, 8 CPU Limit in dropdown with attribute id = storagedevelopment
    And User types John Cypress in input with id = quotaContactName
    And User types testemail@artemtest.com in input with id = quotaContactEmail
    And User types Test Justification text, test-test, 123 in textarea with id = quotaJustification
    And User checks checkbox with attribute id = addressAndGeolocation-planningToUse
    And User checks checkbox with attribute id = formDesignAndSubmission-implemented
    And User checks checkbox with attribute id = publishing-implemented
    And User clicks button with text SUBMIT EDIT REQUEST
    And User clicks button with text Submit
    And User clicks button with text Return to Dashboard
    Then User should be redirected to Requests Tab
    And User should see their Request
