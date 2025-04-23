# Roles and Permissions

The Registry application supports complex and flexible permission use cases through a two-level system of roles and permissions: **global-level** and **document-level** (e.g., product-specific).

## Global Roles

Global roles are defined in **Keycloak**. When a user logs in, the system retrieves their roles from the JWT token issued by Keycloak. These roles are available in the user's session data on both the backend and frontend.

## Global Permissions

Global permissions are defined in the backend codebase. They are assigned based on the user's roles and are also included in the session data, accessible from both the backend and frontend.

## Document-Level Permissions

When a document is retrieved using one of the system’s core database wrapper modules (located under `/services/db/models`), it is automatically decorated with additional fields—most notably, a `_permissions` field. This field reflects the document-level permissions, taking into account both the document context and the user's global permissions.

Since documents are fetched from this core module, the frontend is expected to rely on the decorated permissions to configure UI behavior. This approach simplifies privilege-related logic on the frontend and ensures consistent permission handling across the application.
