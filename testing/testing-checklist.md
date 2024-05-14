### High Level Test Checklist for the Registry App

#### The First Visit

1. Login is possible for both Admin and User.
2. Logout is possible for both Admin and User.
3. Empty list Create button leads to Create page of Private Cloud product for Private Cloud tab and Public Cloud product for Public Cloud.
4. Upper right Create button leads to Create page of Private Cloud product for Private Cloud tab and Public Cloud product for Public Cloud.

#### The Creation

1. Text on the Create Page only has information about the Private Cloud and Public Cloud on corresponding pages.
2. For the User in Private Cloud Clusters dropdown is showing SILVER, GOLD, EMERALD
3. For the User in Private Cloud Clusters dropdown is showing SILVER, GOLD, EMERALD, CLAB, KLAB, KLAB2
4. Ministries dropdown is showing 28 ministries with no duplicates.
5. If one of AG, EMBC, HOUS or PSSG ministries is chosen, the disclaimer with checkbox is shown.
6. For Public Cloud the Providers dropdown has Amazon Web Services option only.
7. Typing letters in the Email field of the Contacts section shows live search results for every of PO and TLs.
8. Clicking one of the contact search results populates all of the fields for every of PO and TLs with corresponding data from IDIR.
9. Clicking a button “Add Secondary Technical Lead” opens a corresponding section for Secondary TL. And the button changes the name to “Remove Secondary Technical Lead”.
10. Symbols other than alphanumeric + spaces and “/. : + = @ \_” in the Public Cloud Product Name shows an error text on Submit and blocks the Submit action.
11. For Public Cloud Budget numbers less than 50 in the Budget fields shows an error text on Submit and blocks the Submit action.
12. For Public Cloud Budget fields allow adding and save decimal numbers.
13. For Public Cloud using non-alphanumeric symbols in Account Coding fields shows an error text on Submit and blocks the Submit action.
14. For Private Cloud If nothing is checked in the Common Components section, the Submit action is blocked.
15. If at least one radio button in Common Components section is checked or text present in Other field, the Submit action is not blocked.
16. Leaving Secondary TL blank after opening his section shows an error text on Submit and blocks the Submit action.
17. Not adding Secondary TL does not block the Submit action.
18. After clicking Submit with valid data the Modal Window shows up. It has the information corresponding to the Cloud type you are requesting (Private or Public).
19. If any of the Modal Window checkboxes is unchecked, Submit button is non-clickable.
20. Clicking “Return to Dashboard” returns user to the Products Tab of corresponding Cloud. The created Request is shown at the In Progress Tab.

#### Requests and Products Tabs

1. 10 rows per page are shown by default.
2. Clicking Products and In Progress buttons moves you to corresponding tab.
3. Clicking on a Product opens the Product Page of the desired Product.
4. Progress Tab shows only the products that are in Reviewing or Provisioning state.
5. Products Tab shows both Provisioned and In Progress products.
6. The Button Request a New Product leads to the Create Page of the corresponding Cloud (Private for Private Cloud and Public for Public Cloud).
7. Search is made by name, contacts name, contacts emails and licence plate at the Requests Tab. The same + Description at the Products Tab.
8. Changing number of rows is changing the number of Products / Requests to the desired number if there is enough items.
9. Clicking next after changing rows shows the next portion of pagination. The last page shows the remaining products and correct numbers. Clicking Previous shows the previous portion of the pagination.
10. Search made on the page of pagination that can’t be reached by the number of found entries should redirect to the first page of pagination.
11. Clicking Export triggers the download of .csv file of currently shown products, minding of Filters and/or Search applied.
12. Filtering by Cluster separately, filtering by Ministry Separately, filtering by both filters at once work as expected.
13. Search plus separate filtering and combined filtering works as expected.
14. The Show Deleted Projects toggle can be turned on and switched off showing corresponding results.
15. Deleted products should be marked visually.

#### Edit Request

1. If the Product is in Pending (Reviewing) or Provisioning (Processing) state - the banner saying that it can’t be edited is displayed, all the fields, dropdowns, deletion button and Submit button are not interactable and grayed out for the users.
2. If the Product is in Pending (Reviewing) state, the Admin is able to change the Quotas and Contacts for Private Cloud / Account Coding, Budget and Contacts for Public Cloud.
3. If the Product is in Provisioned (Completed) state, User can change any field in the Product except Cluster in Private Cloud / Provider in Public Cloud.
4. If the User doesn’t touch any fields, the Submit button is inactive and grayed out.
5. If the User changes any value in any of the fields and then changes it to the previous one, the Submit button is inactive and grayed out.
6. The wording on the Edit page does not have phrases about onboarding and Create Request specific descriptions.
7. Common Components section has at least one checkbox marked or text in Other field.
8. Button Previous returns to the Products Tab.
9. If the Product has Secondary Technical Lead his section is open by default.
10. If the Product doesn’t have a Secondary TL, his section is closed. Clicking Add Secondary Technical Lead opens the section.
11. In Private Cloud Quotas Section the links to namespaces lead to Openshift Console.
12. User Comments section has a comment which the User has added on Submit.
13. In Private Cloud the correct Current Quota is shown under the Quota dropdowns.
14. Clicking Back (Arrow Left) button in the top of the page leads to the Products tab of corresponding Cloud.

#### Delete Request

1. If the Product is not in Pending or Provisioning state the Delete option in the Options menu is enabled.
2. Clicking Delete in the Options opens the Deletion pop-up.
3. The data on the Deletion pop-up has Product Name, Licence Plate and Project Owner data filled.
4. If the product has PVCs or the pods running the Deletion pop-up shows an error: “Not ready to delete” with information that “The deletion check did not pass”.
5. If the product doesn’t have PVCs and running pods the Deletion pop-up shows the text fields to enter Product Owner email and Licence Plate to confirm the deletion.
6. If the Product Owner and/or Licence Plate are empty or have mistakes in them the Delete button is not active.
7. If the PO and Licence Plate are typed in or pasted correctly, the Delete button is active.
8. After clicking the Delete button the pop-up about the successful Deletion Request is shown.
9. After confirming the Deletion Request pop-up the user is redirected to the Products Tab.
10. The Product is shown in the In Progress Tab in Reviewing state.

#### Private Cloud Product Additional Tabs

1. Private Cloud Product page has History and Security tabs.

#### Public Cloud Product Additional Tabs

1. Public Cloud Product page has History and Roles tabs.
2. Clicking Roles Tab displays the Users Dashboard which is open on Admins Tab by default and showing the Product Contacts in the top by default.
