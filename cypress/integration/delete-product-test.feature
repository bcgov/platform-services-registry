Feature: Registry App Delete Request
 As a user
  I want to delete a Request in the Registry App and check its visibility on In Progress tab

  Scenario: Creating a Request and check visibility
    Given I am logged in to the Registry as a User
    When I Create a request with random values
    And I see the Request
    And I log out
    And I log in as an Approval Admin
    And I approve the Create Request
    And I log out
    And I log in as a User
    And I create a Delete Request
    And I log out
    And I log in as an Approval Admin
    And I approve the Delete Request
    Then I cannot see the Product on the Products tab
