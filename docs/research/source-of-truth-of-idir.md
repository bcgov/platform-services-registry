# Transitioning to IDIR GUID as the Source of Truth for User Identification

This document outlines the feasibility, and implementation steps for transitioning from using `email addresses` to using `IDIR GUID` as the unique identifier for IDIR application users. The transition aims to establish `IDIR GUID as the source of truth`, replacing the current reliance on email addresses.

## Impact Areas and Steps for Implementation

### 1. Update the `User` Schema

-   **Require `idirGuid` and make it unique**: Update the schema to set `idirGuid` as a required and unique field.
-   **Require `email` but allow duplicates**: Update the schema to make `email` required without enforcing uniqueness.

*   **Database Validation**: Ensure that all existing users in the database have the `idirGuid` field populated, avoiding `prisma` validation errors.

### 2. Enforce IDIR GUID in Authentication

-   **Token Validation**: During login, reject tokens that do not include the `IDIR GUID`.
-   **User Identification**: After login, use the `DB user ID` or `IDIR GUID` to identify users in `prisma` queries instead of `email`.

### 3. Refactor Prisma Queries

-   Replace instances of `email` with `DB user ID` or `IDIR GUID` in the following `prisma` operations:
    -   `prisma.user.update`
    -   `prisma.user.upsert`
    -   `prisma.user.findUnique`
    -   `prisma.user.findFirst`
    -   `prisma.user.findMany`

### 4. Schema Field Updates

-   **Field Renaming**:
    -   Rename `createdByEmail` to `createdById`.
    -   Rename `decisionMakerEmail` to `decisionMakerId`.
-   **Data Migration**:
    -   Write a migration script to populate the new fields with database IDs.
    -   Update the frontend UI and email templates that currently reference email fields to use the populated data from the newly updated fields (`createdById`, `decisionMakerId`) to retrieve the emails.

### 5. Airflow Integration Adjustment

-   **Sync Logic**:
    -   Modify the `sync_db_users_with_azure_ad` task in Airflow to handle discrepancies between the GUID in Azure AD and the GUID stored in the database.
    -   Archive users whose GUIDs no longer match, under the assumption that such users have been deleted and re-created by the IDIR system (potentially with the same email).
