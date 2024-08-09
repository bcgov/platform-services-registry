## Public Cloud eMOU Workflow Diagram

```mermaid
flowchart TB
    A((Product team creates<br>a new product<br>with billing details))
    A --> B{System checks<br>if the account coding<br>already exists}
    B -->|If exists| B1A(Checkbox displayed:<br>'I have received approval from<br>my Expense Authority<br>for the expenses<br>associated with this project.')
    B1A --> B1B(Submit form)
    B1B --> C
    B -->|If not exists| B2A(Submit form)
    B2A --> B2B(Send eMOU signing request<br>email to Expense Authority)
    B2B --> B2C(Expense Authority logs in<br>and signs the eMOU)
    B2C --> B2D(Send eMOU review request<br>email to Olena)
    B2D --> B2E(Olena logs in<br>and approves the eMOU)
    B2E --> C(Public cloud admin logs in<br>and approves the new product request)
    C --> D[Workspace is provisioned<br>with billing information<br>non-editable]
```
