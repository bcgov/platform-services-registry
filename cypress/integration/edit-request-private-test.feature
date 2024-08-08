Feature: Edit Request
  Background:
    Given User is assigned to Existing Product

  Scenario: Create Private Cloud Edit Request and check visibility
    Given User logs in with username james.smith@gov.bc.ca and password james.smith@gov.bc.ca
    When User clicks link with text PRIVATE CLOUD OPENSHIFT
    And User clicks link with text REQUEST A NEW PRODUCT
    And User navigates to Product Page
    And User changes Product Name
    And User changes Description
    And User selects another Ministry
    And User changes PO contact
    And User changes Primary TL contact
    And User adds Secondary TL contact
    And User changes the CPU quota for Production Namespace
    And User changes the Memory quota for Production Namespace
    And User changes the Storage quota for Production Namespace
    And User changes the CPU quota for Development Namespace
    And User changes the Memory quota for Development Namespace
    And User changes the Storage quota for Development Namespace
    And User changes the CPU quota for Test Namespace
    And User changes the Memory quota for Test Namespace
    And User changes the Storage quota for Test Namespace
    And User changes the CPU quota for Tools Namespace
    And User changes the Memory quota for Tools Namespace
    And User changes the Storage quota for Tools Namespace
    And User checks 3 first Common Components
    And User clicks Submit Request
    And User inputs the Comment in All Set Popup
    And User clicks Submit Edit Request in All Set Popup
    And User clicks Return to Dashboard in Thank You Popup
    Then User should be redirected to Requests Tab
    And User should see their Request
