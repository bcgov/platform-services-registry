# Phase 1 As Built: Systems And Teams

## Summary

Phase 1 was implemented as an additive extension to the existing product-centric registry.

The implementation adds:

-   persistent `System` and `Team` models
-   explicit link models between systems, teams, and existing products
-   CRUD APIs
-   standalone management pages
-   product-detail attachment visibility
-   new session permissions

The implementation intentionally does not alter the existing private/public product workflow logic.

## What Was Implemented

## Persistence Model

The Prisma schema now includes:

-   `System`
-   `Team`
-   `SystemTeamLink`
-   `SystemPrivateCloudProductLink`
-   `SystemPublicCloudProductLink`
-   `TeamPrivateCloudProductLink`
-   `TeamPublicCloudProductLink`
-   `SystemStatus`
-   `TeamMember` as an embedded type

Important schema notes:

-   `UserSession.teams` previously used a Prisma composite `type Team`.
-   That session-only composite was renamed to `SessionTeam` so `Team` could become a real persisted model.
-   Reverse relation fields were added to `PrivateCloudProduct` and `PublicCloudProduct` for Prisma relation support:
    -   `systemLinks`
    -   `teamLinks`

These reverse fields are persistence-level support fields. They do not change the conceptual phase-1 intent that links are managed from the new entities outward.

## System Model As Built

`System` currently includes:

-   `id`
-   `name`
-   `code`
-   `description`
-   `status`
-   `organizationId`
-   `metadata`
-   `rules`
-   `policies`
-   `mappings`
-   `createdAt`
-   `updatedAt`
-   `archivedAt`

`System.status` uses `SystemStatus` with:

-   `ACTIVE`
-   `DRAFT`
-   `ARCHIVED`

## Team Model As Built

`Team` currently includes:

-   `id`
-   `name`
-   `code`
-   `description`
-   `metadata`
-   `rules`
-   `policies`
-   `mappings`
-   `members`
-   `createdAt`
-   `updatedAt`
-   `archivedAt`

`members` is an embedded array of:

-   `userId`
-   `roles: string[]`

Roles are currently freeform.

## API Surface As Built

### Systems API

Implemented route family:

-   `/api/systems`
-   `/api/systems/[id]`
-   `/api/systems/[id]/teams`
-   `/api/systems/[id]/private-cloud-products`
-   `/api/systems/[id]/public-cloud-products`

Capabilities:

-   list systems
-   create system
-   read system detail
-   update system
-   archive system
-   attach/detach team
-   attach/detach private-cloud product
-   attach/detach public-cloud product

### Teams API

Implemented route family:

-   `/api/teams`
-   `/api/teams/[id]`
-   `/api/teams/[id]/members`
-   `/api/teams/[id]/systems`
-   `/api/teams/[id]/private-cloud-products`
-   `/api/teams/[id]/public-cloud-products`

Capabilities:

-   list teams
-   create team
-   read team detail
-   update team
-   archive team
-   replace/update team members
-   attach/detach system
-   attach/detach private-cloud product
-   attach/detach public-cloud product

### Product Attachment Aggregation Endpoints

Implemented:

-   `/api/private-cloud/products/[licencePlate]/attachments`
-   `/api/public-cloud/products/[licencePlate]/attachments`

These endpoints provide read-only attachment summaries for existing product pages:

-   linked systems
-   linked teams

## Authorization As Built

New session permissions:

-   `viewSystems`
-   `manageSystems`
-   `viewTeams`
-   `manageTeams`

Current permission rules:

-   `viewSystems`: any authenticated user
-   `viewTeams`: any authenticated user
-   `manageSystems`: `admin || privateAdmin || publicAdmin`
-   `manageTeams`: `admin || privateAdmin || publicAdmin`

Important non-change:

-   Existing private/public product permission decorators were not modified to consider team membership.
-   Team membership is descriptive only in this phase.

## UI As Built

## Navigation

Added menu entries in the user menu:

-   `Systems`
-   `Teams`

No changes were made to the main private/public tab structure.

## Systems Pages

Implemented:

-   `/systems`
-   `/systems/create`
-   `/systems/[id]`

Current capabilities:

-   list systems
-   create system
-   update system
-   archive system
-   link/unlink teams
-   link/unlink private-cloud products
-   link/unlink public-cloud products

The system detail page is currently a pragmatic management screen rather than a polished dashboard.

## Teams Pages

Implemented:

-   `/teams`
-   `/teams/create`
-   `/teams/[id]`

Current capabilities:

-   list teams
-   create team
-   update team
-   archive team
-   manage members
-   link/unlink systems
-   link/unlink private-cloud products
-   link/unlink public-cloud products

Team member editing is currently simple:

-   pick a user
-   enter comma-separated freeform roles
-   save the member set

## Existing Product Pages

Read-only attachment panels were added to:

-   private-cloud product detail layout
-   public-cloud product detail layout

The panel shows:

-   linked systems
-   linked teams

This panel is read-only in the current implementation.

## Validation And Typing As Built

Added validation schemas:

-   `app/validation-schemas/system.ts`
-   `app/validation-schemas/team.ts`

Added types:

-   `app/types/system.ts`
-   `SystemDecorate`
-   `TeamDecorate`

Added frontend service wrappers:

-   `app/services/backend/systems.ts`
-   `app/services/backend/teams.ts`
-   `app/services/backend/product-attachments.ts`

Added DB-layer helpers:

-   `app/services/db/system.ts`
-   `app/services/db/team.ts`

## Event Logging As Built

Added event types:

-   `CREATE_SYSTEM`
-   `UPDATE_SYSTEM`
-   `DELETE_SYSTEM`
-   `CREATE_TEAM`
-   `UPDATE_TEAM`
-   `DELETE_TEAM`

These are now reflected in event validation and event display naming.

## Important Runtime Issues Encountered

## 1. Stale Prisma Singleton

Observed issue:

-   creating a new system failed with:
    `TypeError: Cannot read properties of undefined (reading 'create')`

Cause:

-   the generated Prisma client on disk contained the new `system` and `team` delegates
-   but the long-lived development singleton in `app/core/prisma.ts` had cached an older Prisma client instance created before the schema change

Fix implemented:

-   the Prisma singleton now verifies that the cached client exposes:
    -   `system`
    -   `team`
    -   all new link delegates
-   if not, it re-creates the client

Result:

-   schema changes involving new Prisma models are more resilient during dev-mode iteration

## 2. Mongo `archivedAt` Filter Behavior

Observed issue:

-   newly created systems and teams did not appear in list views

Cause:

-   list queries filtered on `archivedAt: null`
-   in Mongo-backed Prisma models, a new optional field may be unset rather than explicitly `null`
-   that caused newly created rows to be excluded by the list query

Fix implemented:

-   create paths now explicitly set `archivedAt: null`
-   active queries now treat both of the following as active:
    -   `archivedAt: null`
    -   `archivedAt` not set

This fix was applied to:

-   systems list queries
-   teams list queries
-   product attachment aggregation queries

## What Was Explicitly Not Implemented

-   no automated metadata migration from existing products into systems/teams
-   no backfill of systems/teams from existing product records
-   no product create/edit flow redesign
-   no system/team-based authorization model
-   no generalized arbitrary entity graph
-   no synchronization logic between product metadata and linked system/team metadata
-   no product-side attachment editing UI beyond visibility on the product detail page

## Gaps / Rough Edges In The Current Build

### Product linking UX

The product-linking UI currently uses the internal product `id` as the API key, while users discover products visually by:

-   product name
-   licence plate

The UI works, but it is not yet especially explicit about identifiers.

### Team member UX

Team member roles are entered as freeform comma-separated strings.

This matches the phase-1 flexibility goal, but it is operationally rough and likely needs refinement.

### Detail pages

The system and team detail pages are functional management screens, not finalized UX.

### Tests

Focused API tests were added for the new route families, but full execution in this environment was blocked by a local Next SWC runtime issue unrelated to the feature logic.

## Verification Performed During Implementation

Successfully completed:

-   Prisma client generation
-   Prisma schema validation
-   targeted ESLint on the changed files
-   changed-file TypeScript verification for the new feature area

Not reliably executable in this environment:

-   Jest route tests that depend on the local Next test runtime

Reason:

-   local SWC binary/runtime loading issues in the environment, separate from feature code

## Current Phase-1 Interpretation

The implementation should be understood as:

-   a persistence and UI foothold for future system/team modeling
-   a non-breaking extension of the current registry
-   a transitional architecture that supports future metadata refactoring without yet forcing it

In other words, the current build adds real `System` and `Team` entities and makes them usable, but it deliberately stops short of making them the new operational center of the registry.
