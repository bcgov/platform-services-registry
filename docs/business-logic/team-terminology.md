# Team terminology

"Team" means three unrelated things here. Decide which one you mean before writing code that
says `team`.

| If you mean | Use | Where it lives |
| --- | --- | --- |
| A Keycloak service account on the session | `SessionTeam` | `UserSession.teams` |
| The people responsible for a product today | contact fields and `members` | on each product document |
| A team of people as a record | `Team` | does not exist yet |

**1. `SessionTeam`** is a service account, not people. A composite type on `UserSession` holding
a `clientId` and roles, populated in `app/core/auth-options.ts` from access token entries
prefixed `z_pltsvc-tsa-`. It was called `Team` until this name was needed for meaning 3. See
[service accounts](./service-accounts.md).

**2. Product contact fields are where a product's real people live today.** On each product:
`projectOwnerId`, `primaryTechnicalLeadId`, `secondaryTechnicalLeadId`, `expenseAuthorityId`
(public cloud only), and a `members` array. Access to a product is decided from these fields.

**3. `Team` does not exist yet.** Planned work adds `Team`, `System`, and `Resource` joined by
typed relationships. Until then, meaning 2 is the system of record for people.
