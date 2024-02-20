## Email Scenarios

### Private Cloud

#### New project set request emails Scenarios

1.

```mermaid
flowchart LR
    A[Create request] --> B(Emails:
    Create Request Received sent to Admins
    Create Request Received sent to PO/TLs
    )
    B --> C{Admin decides on the request}
    C -->|Request approved| D(Create Request Approved email sent to PO/TLs)
    C -->|Request rejected| E(Create Request Rejected email sent to PO/TLs)
```

#### Edit quota request emails Scenarios

```mermaid
flowchart LR
    A[Edit quota request] --> B(Emails:
    Edit Quota Request Received sent to Admins
    Edit Quota Request Received sent to PO/TLs
    )
    B --> C{Admin decides on the request}
    C -->|Request approved| D(Edit Quota Request Approved email sent to PO/TLs)
    C -->|Request rejected| E(Edit Quota Request Rejected email sent to PO/TLs)
```

#### Edit List of Contacts or/and Name or/and Description or/and Ministry or/and Common Components request emails Scenarios

```mermaid
flowchart LR
    A[Edit request] --> B(Edit Request Received sent to PO/TLs)
    B -->|Request Provisioned| C(Edit Request Provisioned email sent to PO/TLs)
```
