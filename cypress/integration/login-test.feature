Feature: Registry App Login
 As a user
  I want to log in to the Registry App with valid credentials

  Scenario: Logging in with valid credentials
    Given I am on the Registry App login page
    When I type and submit in login and password
    Then I should see 'Create' button
