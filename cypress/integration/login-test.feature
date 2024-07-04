Feature: Login

  Scenario: As an existing user, I want to log in successfully
    Given User is on Login page
    When User clicks Login
    And User enters username and password
    And User navigates to Private Cloud page
    Then User should see Private Cloud Openshift tab
    And User should see Public Cloud Landing Zones tab
