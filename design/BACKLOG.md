# Backlog

This document tracks follow-up ideas, open questions, and candidate workstreams related to the emerging `Team` / `System` / `Resource` model.

## Identity And Access

-   Integrate with CSTAR.
-   Figure out how to use the CSTAR model for fine-grained access to non-tenant-aware resources.
    Example: how to manage access to GitHub repositories through CSTAR / Registry.
-   Ability to link to a CSTAR tenant or tenant resources.
-   Explore whether `Team` or `System` should support linking to tenants in a `1:M` way.

## Data Model And Core Concepts

-   Introduce `Components`.
-   Introduce `Environments`.
-   Clarify the difference between `Component` and `Resource` where the distinction is fuzzy.
    Example: a self-hosted database may be a `Component`, while a DBaaS offering may be a `Resource`.
-   Rejig the data model so it is more flexible.
-   Discover candidate `Components` from OpenShift and public-cloud resources.

## Resource Model Expansion

-   Add additional resource types, even initially as placeholders or demo entities:
    -   GitHub repository
    -   SSO client
    -   AI Service Hub tenancy
    -   API
    -   CI pipeline
    -   GitHub Copilot license
    -   GitHub App
    -   MS Teams channel
    -   `n8n` webhook
    -   additional resource types to be identified

## Systems And Portfolio Modeling

-   Load division apps in as `Systems`.
-   Idea: drag-and-drop "system builder" from a palette of resources.
-   Idea: system templates.
-   Open question: is a template effectively the same thing as a wizard, or are those separate concepts?

## Provisioning And Provider Experience

-   How to make provisioning forms modular, reusable, and client-configurable.
-   Provider onboarding PoC.

## Product Direction And Positioning

-   Figure out how this relates to DevHub.
-   What is the MVP?
    -   Introduce `Team` and `System` concepts.
    -   Import existing non-cloud apps as `Systems`.
