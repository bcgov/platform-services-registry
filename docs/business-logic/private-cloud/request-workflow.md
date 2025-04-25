# Private Cloud Request Workflow

There are three types of private cloud requests, each with its own workflow leading to provisioning or completion.

---

## CREATE Request

This is the initial request submitted by a project team to launch a new product environment on OpenShift.

### Workflow

```mermaid
flowchart TB
    A((New Product Page))
    A --> A1[Submit request]
    A1 --> B{Private Cloud Admin Decision}
    B -->|Approve| C1[Notify project team of approval]
    C1 --> C2[Send NATS message to provisioner service]
    C2 --> C3[Provisioner creates workspace on OpenShift cluster]
    C3 -->|Callback triggered| C4[Registry App marks request as completed]
    C4 --> C5((New product is created))
    B -->|Reject with admin note| D1[Notify project team of rejection]
    D1 --> D2[Registry App marks request as rejected]
```

---

## EDIT Request

The project team submits an edit request to modify an existing product, such as updating quotas.

### Workflow

```mermaid
flowchart TB
    A((Product Edit Page))
    A --> A1[Submit request]
    A1 --> B{System Decision}
    B -->|Auto-approve| C1[Notify project team of auto-approval]
    C1 --> D1[Send NATS message to provisioner service]
    D1 --> D2[Provisioner updates workspace on OpenShift cluster]
    D2 -->|Callback triggered| D3[Registry App marks request as completed]
    D3 --> D4((Product is updated))
    B -->|Manual review required| E1[Notify Private Cloud Admin for review]
    E1 --> E2{Private Cloud Admin Decision}
    E2 -->|Approve| F1[Notify project team of approval]
    F1 --> D1
    E2 -->|Reject with admin note| F2[Notify project team of rejection]
    F2 --> F3[Registry App marks request as rejected]
```

---

## DELETE Request

The project team submits a delete request to archive an existing product.

### Workflow

```mermaid
flowchart TB
    A((Product Edit Page))
    A --> A1[Delete via dropdown]
    A1 --> B{Private Cloud Admin Decision}
    B -->|Approve| C1[Notify project team of approval]
    C1 --> C2[Send NATS message to provisioner service]
    C2 --> C3[Provisioner archives workspace on OpenShift cluster]
    C3 -->|Callback triggered| C4[Registry App marks request as completed]
    C4 --> C5((Product is archived))
    B -->|Reject with admin note| D1[Notify project team of rejection]
    D1 --> D2[Registry App marks request as rejected]
```
