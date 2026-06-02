# Registry Roles Guide

## Purpose

This guide explains Registry roles in practical terms to help administrators assign the correct access to users.

The Registry uses Role-Based Access Control (RBAC).
Roles are assigned through Keycloak and translated into application permissions.

---

# Global Roles

Global roles apply across both Private Cloud and Public Cloud unless otherwise specified.

---

## `admin`

### Purpose

Full platform administrator access.

### Can

-   Create all products
-   Edit all products
-   Delete all products
-   Review all requests
-   Manage users
-   Assign roles
-   Manage organizations
-   Access billing
-   Access analytics
-   Manage unit prices
-   View tasks/events/users

### Typical Users

-   Core Registry administrators
-   Senior platform support staff

### Important

This is the highest privilege role.

Avoid assigning unless absolutely necessary.

---

## `editor`

### Purpose

Global editing access across Registry products.

### Can

-   View all Private Cloud products
-   View all Public Cloud products
-   Edit all Private Cloud products
-   Edit all Public Cloud products
-   Delete all Private Cloud products
-   Delete all Public Cloud products
-   Edit Private Cloud webhooks

### Cannot

-   Review requests
-   Manage users
-   Assign roles
-   Manage organizations
-   Access billing administration

### Typical Users

-   Operations teams
-   Product support staff

---

## `reader`

### Purpose

Global read-only access.

### Can

-   View all Private Cloud products
-   View all Public Cloud products

### Cannot

-   Create products
-   Edit products
-   Delete products
-   Review requests

### Typical Users

-   Auditors
-   Stakeholders
-   Read-only support users

---

# Private Cloud Roles

Private Cloud roles only affect Private Cloud resources.

---

## `private-admin`

### Purpose

Administrative access for Private Cloud.

### Can

-   Create Private Cloud products
-   Edit all Private Cloud products
-   Delete all Private Cloud products
-   Review all Private Cloud requests
-   View Private Cloud product history
-   Manage organizations
-   Manage Private Cloud comments
-   View Private Cloud unit prices
-   View/edit Private Cloud webhooks

### Can Access

-   Products not assigned to the user
-   All Private Cloud requests
-   All Private Cloud records

### Typical Users

-   Private Cloud platform administrators

---

## `private-editor`

### Purpose

Editing access for Private Cloud products.

### Can

-   View all Private Cloud products
-   Edit all Private Cloud products
-   Delete all Private Cloud products
-   Edit Private Cloud webhooks

### Cannot

-   Create Private Cloud products
-   Review requests
-   Manage organizations

### Can Access

-   Products not assigned to the user

### Typical Users

-   Platform operations teams

---

## `private-reader`

### Purpose

Read-only Private Cloud access.

### Can

-   View all Private Cloud products
-   View Private Cloud webhooks
-   View Private Cloud unit prices

### Cannot

-   Create products
-   Edit products
-   Delete products
-   Review requests

### Can Access

-   Products not assigned to the user

### Typical Users

-   Auditors
-   Read-only operational users

---

## `private-reviewer`

### Purpose

Review and approval role for Private Cloud requests.

### Can

-   Review Private Cloud requests
-   View all Private Cloud products
-   Edit onboarding dates

### Cannot

-   Create products
-   Edit products
-   Delete products

### Can Access

-   All Private Cloud requests
-   Products not assigned to the user

### Typical Users

-   Governance teams
-   Approval coordinators

---

## `private-analyzer`

### Purpose

Private Cloud analytics access.

### Can

-   View Private Cloud analytics dashboards

### Cannot

-   Edit products
-   Review requests

### Typical Users

-   Analytics/reporting users

---

# Public Cloud Roles

Public Cloud roles only affect Public Cloud resources.

---

## `public-admin`

### Purpose

Administrative access for Public Cloud.

### Can

-   Create Public Cloud products
-   Edit all Public Cloud products
-   Delete all Public Cloud products
-   Review all Public Cloud requests
-   View Public Cloud history
-   Manage Public Cloud comments
-   View Public Cloud billing

### Can Access

-   Products not assigned to the user
-   All Public Cloud requests

### Typical Users

-   Public Cloud administrators

---

## `public-editor`

### Purpose

Editing access for Public Cloud products.

### Can

-   View all Public Cloud products
-   Edit all Public Cloud products
-   Delete all Public Cloud product

### Cannot

-   Create Public Cloud products
-   Review requests

### Can Access

-   Products not assigned to the user

### Typical Users

-   Cloud operations teams

---

## `public-reader`

### Purpose

Read-only Public Cloud access.

### Can

-   View all Public Cloud products

### Cannot

-   Create products
-   Edit products
-   Delete products
-   Review requests

### Can Access

-   Products not assigned to the user

### Typical Users

-   Stakeholders
-   Auditors

---

## `public-reviewer`

### Purpose

Review and approval role for Public Cloud requests.

### Can

-   Review Public Cloud requests
-   View Public Cloud billing
-   View all Public Cloud products

### Cannot

-   Edit products
-   Delete products

### Can Access

-   All Public Cloud requests
-   Products not assigned to the user

### Typical Users

-   Governance teams
-   Cloud reviewers

---

## `public-analyzer`

### Purpose

Public Cloud analytics access.

### Can

-   View Public Cloud analytics dashboards

### Typical Users

-   Reporting teams
-   Analytics users

---

# Billing and Finance Roles

---

## `billing-reviewer`

### Purpose

Billing review role.

### Can

-   Review Public Cloud billing
-   View Public Cloud billing
-   Download billing MOU files
-   Send billing/task emails

### Cannot

-   Edit products
-   Review cloud requests

### Typical Users

-   Billing review teams

---

## `billing-manager`

### Purpose

Operational billing management.

### Can

-   View Public Cloud billing
-   View Private Cloud billing
-   Send billing/task emails

### Typical Users

-   Billing operations staff

---

## `billing-reader`

### Purpose

Read-only billing access.

### Can

-   View Public Cloud billing
-   View Private Cloud billing
-   Download billing MOU files

### Cannot

-   Review billing
-   Edit products

### Typical Users

-   Financial stakeholders
-   Reporting users

---

## `finance-manager`

### Purpose

Private Cloud financial administration.

### Can

-   View Private Cloud billing
-   Manage Private Cloud unit pricing

### Cannot

-   Edit products
-   Review requests

### Typical Users

-   Finance teams
-   Cost recovery administrators

---

# Analytics Roles

---

## `analyzer`

### Purpose

Full analytics access.

### Can

-   View general analytics
-   View Public Cloud analytics
-   View Private Cloud analytics
-   View ZAP scan results
-   View Sonar scan results

### Typical Users

-   Security teams
-   Reporting teams

---

# Operational Roles

---

## `user-reader`

### Purpose

Read-only user visibility.

### Can

-   View users

### Typical Users

-   Support staff
-   Audit teams

---

## `event-reader`

### Purpose

Read-only event visibility.

### Can

-   View Registry events

### Typical Users

-   Operational support teams

---

## `task-reader`

### Purpose

Read-only task visibility.

### Can

-   View Registry tasks

### Typical Users

-   Coordinators
-   Operations staff

---

# Default User Role

---

## `user`

### Purpose

Standard authenticated Registry user.

Automatically assigned to authenticated users found in the Registry database.

### Can

-   View assigned products
-   Edit assigned products
-   Create products as assignee
-   Cancel Private Cloud requests
-   View organizations

### Cannot

-   View all products globally
-   Access products not assigned to them

### Typical Users

-   Standard Registry users

---

# Ministry Roles

The Registry supports ministry-scoped roles.

Format:

```txt
ministry-{MINISTRY_CODE}-{ROLE}
```

Example:

```txt
ministry-citz-editor
```

### Purpose

Limits access to organizations associated with a specific ministry.

### Example

```txt
ministry-citz-editor
```

Can edit products belonging to organizations mapped to the `CITZ` ministry only.

---

# Private vs Public Cloud Differences

| Capability         | Private Cloud      | Public Cloud      |
| ------------------ | ------------------ | ----------------- |
| Reviewer role      | `private-reviewer` | `public-reviewer` |
| Analyzer role      | `private-analyzer` | `public-analyzer` |
| Billing visibility | Limited            | Extensive         |
| Unit pricing       | Yes                | No                |
| Finance management | Yes                | No                |

---

# Best Practices

## Prefer least privilege

Assign the minimum access required.

---

## Prefer scoped roles

Prefer:

```txt
private-reader
```

instead of:

```txt
reader
```

when possible.

---

## Avoid unnecessary `admin` access

`admin` provides broad platform-wide permissions and should only be assigned to core administrators.test
