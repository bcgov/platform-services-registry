# Public Cloud Request Workflow

There are three types of public cloud requests, each with a distinct workflow that leads to provisioning or completion.

---

## CREATE Request

The project team initiates a request to launch a new product environment on a selected public cloud.

### Workflow

```mermaid
flowchart TB
    A((New Product Page))
    A --> A1[Notify Expense Authority to sign eMOU]
    A1 --> A2[Expense Authority signs eMOU]
    A2 --> A3[Notify Cloud Expense Authority Director for approval]
    A3 --> A4[Cloud Expense Authority Director approves eMOU]
    A4 --> B{Public Cloud Admin Decision}
    B -->|Approve| C1[Notify project team of approval]
    C1 --> C2[Send NATS message to provisioner service]
    C2 --> C3[Provisioner creates workspace on selected public cloud cluster]
    C3 -->|Callback triggered| C4[Registry App marks request as completed]
    C4 --> C5((New product is created))
    B -->|Reject with admin note| D1[Notify project team of rejection]
    D1 --> D2[Registry App marks request as rejected]
```

---

## EDIT Request

The project team submits an edit request to modify an existing product.

### Workflow

```mermaid
flowchart TB
    A((Product Edit Page))
    A --> B{System Decision}
    B -->|Auto-approve| C1[Notify project team of auto-approval]
    C1 --> D1[Send NATS message to provisioner service]
    D1 --> D2[Provisioner updates workspace on selected public cloud cluster]
    D2 -->|Callback triggered| D3[Registry App marks request as completed]
    D3 --> D4((Product is updated))
```

---

## DELETE Request

The project team submits a delete request to archive an existing product.

### Workflow

```mermaid
flowchart TB
    A((Product Edit Page))
    A --> B{Public Cloud Admin Decision}
    B -->|Approve| C1[Notify project team of approval]
    C1 --> C2[Send NATS message to provisioner service]
    C2 --> C3[Provisioner archives workspace on selected public cloud cluster]
    C3 -->|Callback triggered| C4[Registry App marks request as completed]
    C4 --> C5((Product is archived))
    B -->|Reject with admin note| D1[Notify project team of rejection]
    D1 --> D2[Registry App marks request as rejected]
```
