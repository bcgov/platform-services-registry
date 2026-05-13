# Phase 1 Spec: Systems And Teams

## Overview

This phase introduces two new first-class entities into the Platform Services Registry:

-   `System`
-   `Team`

The goal is to create durable "homes" for higher-level system metadata and team/people metadata without disrupting the existing private-cloud and public-cloud product workflows that the production application already relies on.

This is an additive, non-breaking phase. It is intentionally acceptable for the resulting UI and information architecture to feel somewhat separate or transitional.

## Problem Statement

The current registry is strongly product-centric and platform-centric:

-   private cloud products
-   public cloud products
-   product-specific ownership/contact fields
-   product-specific member lists and permissions

That structure works for provisioning and operational workflows, but it is not a good long-term fit for modeling:

-   a real-world system that spans multiple platform resources
-   a team that works across multiple systems and resources
-   cross-platform ownership and relationship mapping

Phase 1 creates a place to start modeling those concepts while preserving the current operational product model.

## Primary Objectives

### 1. Introduce `System`

A `System` is a logical container for related resources and services required for a system to function.

In phase 1, a `System` should:

-   have its own identity and metadata
-   optionally connect to an organization
-   attach to existing private-cloud and public-cloud products
-   attach to one or more teams
-   serve as a place to hold higher-level non-platform-specific system/application information

It is intentionally not the provisioning object in phase 1.

### 2. Introduce `Team`

A `Team` is a group of people who work together on one or more systems and who have some relationship to related resources.

In phase 1, a `Team` should:

-   be a standalone managed entity
-   contain an explicit membership list
-   allow freeform team member roles
-   attach to systems
-   attach directly to existing private-cloud and public-cloud products
-   serve as the home for people/access/ownership-group-oriented metadata

It is intentionally not an authorization source for product access in phase 1.

### 3. Preserve Existing Product Behavior

Phase 1 must not break or substantially reshape:

-   private cloud product create/edit/delete/request flows
-   public cloud product create/edit/delete/request flows
-   provisioning behavior
-   billing behavior
-   request review behavior
-   existing product authorization logic
-   existing product persistence model

Existing products remain the operational truth for current platform workflows.

## Scope

### In scope

-   new persistent `System` entity
-   new persistent `Team` entity
-   new attachment/link models between:
    -   `System` and `Team`
    -   `System` and private-cloud products
    -   `System` and public-cloud products
    -   `Team` and private-cloud products
    -   `Team` and public-cloud products
-   CRUD APIs for systems and teams
-   link management APIs
-   standalone management UI pages for systems and teams
-   consolidated detail views for systems and teams
-   read-only visibility of linked systems/teams from product detail pages
-   permission flags for viewing/managing systems and teams
-   event logging for create/update/delete actions

### Out of scope

-   replacing private/public products as the core operational entity
-   automatic migration/backfill from existing product metadata
-   syncing system/team metadata back into products
-   making team membership affect product authorization
-   redesigning the top-level app navigation around systems/teams
-   changing provisioning contracts
-   changing request workflows
-   building a generalized graph engine for arbitrary entity attachment

## Requirements

## Data Model Requirements

### System

`System` must support:

-   `id`
-   `name`
-   `code`
-   `description`
-   `status`
-   `organizationId` (optional)
-   `metadata`
-   `rules`
-   `policies`
-   `mappings`
-   `createdAt`
-   `updatedAt`
-   `archivedAt`

`System` metadata fields should be flexible enough to support abstract modeling while design conventions are still forming.

### Team

`Team` must support:

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

`members` must support:

-   `userId`
-   `roles: string[]`

Roles are intentionally freeform in phase 1.

### Linkage Requirements

Links must exist explicitly for:

-   `System <-> Team`
-   `System -> PrivateCloudProduct`
-   `System -> PublicCloudProduct`
-   `Team -> PrivateCloudProduct`
-   `Team -> PublicCloudProduct`

Conceptually, the new entities are the source of attachment in phase 1. Existing product behavior should not be redesigned around reverse link management.

## Authorization Requirements

### View permissions

Any authenticated user may:

-   view systems
-   view teams

### Management permissions

Management access should be limited to:

-   `admin`
-   `private-admin`
-   `public-admin`

Management access includes:

-   create/update/archive systems
-   create/update/archive teams
-   manage system/team links
-   manage team membership

### Non-requirement

Team membership must not change private/public product authorization in phase 1.

## UI Requirements

### Navigation

Additive, low-risk navigation changes only:

-   add `Systems` and `Teams` entries to the user/admin menu
-   do not restructure the main private/public product navigation yet

### Systems UI

Must provide:

-   systems list page
-   create system page/form
-   system detail page
-   system editing
-   linking/unlinking teams
-   linking/unlinking private-cloud products
-   linking/unlinking public-cloud products

### Teams UI

Must provide:

-   teams list page
-   create team page/form
-   team detail page
-   team editing
-   editing members and freeform team roles
-   linking/unlinking systems
-   linking/unlinking private-cloud products
-   linking/unlinking public-cloud products

### Existing Product UI

Private and public product detail pages should show:

-   linked systems
-   linked teams

This display is read-only in phase 1.

## Metadata Strategy

Phase 1 should establish:

-   `System` as the preferred home for higher-level system/application metadata
-   `Team` as the preferred home for people/access/ownership-group metadata

But phase 1 should not require:

-   canonical ownership transfer away from product records
-   removal of overlapping product metadata
-   automatic conflict resolution between linked entities and products

Temporary duplication and drift are acceptable.

## Operational Constraints

-   The app uses Next.js + Prisma + MongoDB.
-   The implementation should fit existing repo conventions.
-   Existing product APIs and screens should remain operational.
-   This work should avoid invasive changes to the existing product-specific permission decorators.

## Acceptance Criteria

Phase 1 is successful when:

-   a user with management permission can create and edit systems
-   a user with management permission can create and edit teams
-   teams can contain members with freeform role strings
-   systems can be linked to teams
-   systems and teams can each be linked to private/public products
-   systems and teams appear in dedicated list views
-   a product detail page can show its linked systems and teams
-   no existing private/public product workflow is broken
-   no product authorization behavior changes because of team links

## Follow-Up Considerations

Likely future design directions after phase 1:

-   canonical metadata extraction from products into systems/teams
-   more structured team roles
-   richer search/filtering for product attachment workflows
-   better system/team dashboards
-   eventual use of system/team relationships in access policy evaluation
-   migration toward a more normalized cross-platform portfolio model
