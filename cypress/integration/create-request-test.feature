Feature: Registry App Create Request
 As a user
  I want to create a Request in the Registry App and check its visibility on In Progress tab

  Scenario: Creating a Request and check visibility
    Given I am logged in to the Registry
    When I Create a request with random values
    Then I should be redirected to the In Progress tab
    And I should see the corresponding request
