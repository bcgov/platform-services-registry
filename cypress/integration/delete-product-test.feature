Feature: Delete Request
  Background:
    Given There is a product with names james.smith@gov.bc.ca and john.doe@gov.bc.ca waiting for Review
    And User logs in with username james.smith@gov.bc.ca and password james.smith@gov.bc.ca

  Scenario: Delete Request and check visibility
    When User navigates to Product Page
    And User clicks button with text Options
    And User clicks button with text Delete
    And User inputs Licence Plate
    And User types james.smith@gov.bc.ca in input with id = owner-email
    And User clicks button with text Delete
    And User clicks button with text Return to Dashboard
    And User clicks link with text Requests
    And User should see their Request
