# Public Cloud eMOU Workflow Diagram

There are two scenarios where the eMOU workflow is triggered:

1. When a project team requests a new project set in the Public Cloud Workspaces.
2. When there is a change to the account coding or expense authority on an existing project set.

## 1. New project set request

```mermaid
flowchart TB
    A((Product Team requests a new product))
    A --> B(Send eMOU signing request to Expense Authority)
    B --> C(Expense Authority signs eMOU with account coding)
    C --> D(Send review request to Cloud Expense Authority Director)
    D --> E{Cloud Expense Authority Director decision}
    E -->|Confirm| F(Send review request to Public Cloud Admin)
    E -->|Deny| G(Notify Project Team to close the request manually)
    F --> H{Public Cloud Admin decision}
    H -->|Approve| I(Send NATS message to provision the product)
    H -->|Reject| J(Notify Project Team request rejected and closed)
```

## 2. Account Coding Updated

```mermaid
flowchart TB
    A((Expense Authority / Billing Manager updates account coding))
    A --> B(Send eMOU signing request to Expense Authority)
    B --> C(Expense Authority signs eMOU on product billing page)
    C --> D(Send review request to Cloud Expense Authority Director)
    D --> E{Cloud Expense Authority Director decision}
    E -->|Confirm| F(Process completes)
    E -->|Deny| G(Notify Expense Authority to update account coding manually)
```

## 3. Expense Authority Changed

```mermaid
flowchart TB
    A((Product Owner / Technical Lead updates the Expense Authority))
    A --> B(Send eMOU signing request to new Expense Authority)
    B --> C(New Expense Authority signs eMOU on product billing page)
    C --> D(Send review request to Cloud Expense Authority Director)
    D --> E{Cloud Expense Authority Director decision}
    E -->|Confirm| F(Process completes)
    E -->|Deny| G(Notify Product Team to address concerns manually)
```
