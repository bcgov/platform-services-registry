![[common/header.md]]

[Dashboard](./dashboard.md) > Systems

# Systems

Browse and manage system containers that group related teams and cloud products.

::: row {right}
[+ Create System]\*
:::

::: card
::: row
Search by Name
[Search systems_____________]{type:search}

Filter by Origin
[All Origins_____________v]

-   All Origins
-   GitHub
-   Keycloak

Archived
[Hide Archived___________v]

-   Hide Archived
-   Show Archived
-   Only Archived
    :::

| Name                                | Code     | Origin                | Consolidation             | Status   | Teams | Resources |
| :---------------------------------- | :------- | :-------------------- | :------------------------ | :------- | :---- | :-------- |
| [Registry App](system-detail.md)    | REG-APP  | ((GitHub)){primary}   | ((Consolidated)){success} | ACTIVE   | 2     | 3         |
| [Billing Service](system-detail.md) | BILL-SRV | ((GitHub)){primary}   | ((Partial)){warning}      | ACTIVE   | 1     | 1         |
| [Legacy Portal](system-detail.md)   | LEG-PORT | ((Keycloak)){warning} | ((None)){error}           | ARCHIVED | 0     | 0         |

::: row {right}
< [1]\* 2 3 >
:::
:::
