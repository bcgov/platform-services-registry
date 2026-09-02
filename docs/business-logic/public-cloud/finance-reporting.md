# Public Cloud financial reporting (prototype)

## Account / subscription join keys

Ingestion joins provider billing lines to registry products via account or subscription identifiers.

| Provider      | Native product field                                     | Notes                                                        |
| ------------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| AWS_LZA       | `PublicCloudProduct.awsAccounts[].accountId`             | Written on provision callback (console + finance fallback)   |
| Azure         | `PublicCloudProduct.azureSubscriptions[].subscriptionId` | Same pattern as LZA; written on provision callback           |
| AWS (classic) | —                                                        | No native account field; optional `billingAccountLinks` only |

`billingAccountLinks` is the preferred join source for all providers when present:

```json
[{ "provider": "AZURE", "accountIdentifier": "<subscription-id>", "environment": "production" }]
```

Ingestion falls back to LZA `awsAccounts` or Azure `azureSubscriptions` when `billingAccountLinks` is empty.

Billing lines that cannot be matched go to `UnmatchedBillingLine` and are excluded from per-product figures. Same-provider account collisions stay unmatched. Accounts known only on another provider are skipped so an AWS ingest does not queue LZA IDs; those dollars attach on the LZA ingest.

## Deleted / archived products

Archiving a product (`ProjectStatus.INACTIVE`) must **not** erase finance or forecast history.

| Area                         | Behaviour                                                                                     |
| ---------------------------- | --------------------------------------------------------------------------------------------- |
| Stored actuals / rollups     | Kept forever by `licencePlate`; never cascaded away on archive                                |
| Forecast rows                | Kept; remain in platform forecast rollups and exports                                         |
| Finance snapshot / rankings  | Include ACTIVE **and** INACTIVE so FY totals stay complete                                    |
| Ingest matching              | Still matches INACTIVE products so residual provider billing attaches to the historical plate |
| Forecast coverage chase list | ACTIVE only — do not chase owners of archived products                                        |

Product finance pages keyed by licence plate continue to show historical actuals and variance notes after archive.

## Product existence vs missing actuals

A month with no rollup is missing only if the account or subscription already existed.

| Signal                           | Used as                                                  |
| -------------------------------- | -------------------------------------------------------- |
| Create request `provisionedDate` | First month the account/sub could have spend (preferred) |
| Product `createdAt`              | Fallback when provision date is absent                   |

Months before that start are out of scope (`—`, not incomplete). After a successful provider-month ingest, products that existed in that month get a rollup, including **$0** when they had no billing lines. Estate FYTD coverage only expects closed months where at least one in-scope product existed. FYTD actuals, forecast, snapshot chips, and rankings include every rollup we have through today (current month is month-to-date). The current calendar month is shown as partial until it closes. Scheduled backfill stays at `IngestionRun` grain, always refreshes the current and last complete months, and still re-runs failed estate months.

Concurrent ingest of the same provider/month is blocked by `IngestionLock` (required unique `key`). A second persist returns **409** (not 500); Airflow retries that POST until the lock is free. Push that model before running ingest; drop any leftover `IngestionRun.ingestLockKey` unique index from the earlier optional-field lock.

## FX (USD → CAD)

AWS Cost Explorer amounts are typically USD. At ingest time for a billing month (invoice / month-end), the registry:

1. Loads or creates a `MonthlyFxRate` row for `USD_CAD` × year × month
2. Fetches Bank of Canada Valet `FXUSDCAD` for that calendar month and stores the **last** observation (closest business day to month-end)
3. Converts line amounts with that historical rate and records `fxRate` / `fxRateDate` on each spend row

If Valet is unreachable, ingest may fall back to `FINANCE_USD_CAD_RATE` and still persist that value as the month’s rate (source marked accordingly). Prefer fixing network access over relying on the env default.

## Actuals by environment

The registry app never calls Cost Explorer or Cost Management. Test and prod Airflow DAGs fetch real billing, then persist via `POST /api/public-cloud/finance/ingest/lines`. The `_dev` DAG (Silver **dev** and local by default) never calls the cloud APIs; dev has no bill. It passes a `fetch_rows` generator (`_finance_ingest_dev_data.py`) to the shared `trigger_finance_ingest`, which pages `GET /api/v1/public-cloud/products?status=ACTIVE`, flattens each product's `accountId` links, invents amounts in the DAG, and POSTs normal lines. Persist is unchanged. `accountId` is an additive field on the v1 product list / detail responses (`[{ provider, accountIdentifier, environment? }]`, resolved from `billingAccountLinks` with `awsAccounts` / `azureSubscriptions` fallback) and is available to any service-account consumer, not only Airflow.

| Environment     | DAG                                | Billing source                                      |
| --------------- | ---------------------------------- | --------------------------------------------------- |
| Dev             | `public_cloud_finance_ingest_dev`  | Generated amounts on real product account / sub IDs |
| Test            | `public_cloud_finance_ingest_test` | Cost Explorer + Cost Management (Forge)             |
| Prod            | `public_cloud_finance_ingest_prod` | Cost Explorer + Cost Management                     |
| Local (default) | `_dev`                             | Generated, no cloud keys                            |
| Local (option)  | `_test`                            | Real Forge billing via your `aws sso` / `az login`  |

Local Airflow is `make local-airflow` (port 8082, user `admin` / `admin`). That target sources `app/.env.local` and force-recreates the container. Compose points **both** `_dev` and `_test` at the local registry and sandbox Keycloak via `DEV_*` / `TEST_*` overrides (`*_REGISTRY_BASE_URL`, `*_KEYCLOAK_AUTH_URL`, `*_KEYCLOAK_REALM`, `*_FINANCE_SA_ID` / `_SECRET`); in the cluster those are unset and the Silver defaults apply. The snapshot button queues `_dev` unless `.env.local` sets `AIRFLOW_FINANCE_DAG_ID=public_cloud_finance_ingest_test`, which needs `AWS_PROFILE` and `FINANCE_AZURE_COST_SCOPE` (`aws sso login` / `az login` as needed). Drop any leftover `AIRFLOW_FINANCE_DAG_ID=public_cloud_finance_ingest_local`.

Local product seed is two modes. `pnpm seed-all-local` creates ~110 invented products for UI and forecast testing (their invented billing links will receive generated amounts). `pnpm seed-forge-finance-local` seeds the Forge AWS / Azure test plates from `FINANCE_LIVE_TEST_LICENCE_PLATES` and `FINANCE_LIVE_TEST_ACCOUNT_IDS` in `.env.local`. Pass `--reset` on the Forge seed to drop the invented demo products first.

## Provider credentials

The **registry app does not fetch Azure or AWS billing**. Airflow task pods call Cost Explorer and Cost Management, then POST source-currency lines. The app converts USD→CAD, matches products, and writes spend / rollups / flags.

### Architecture

```
Airflow (schedule or snapshot "Ingest missing months")
  ├─ GET /api/public-cloud/finance/ingest/missing
  │    └─ current FY months through the in-progress month with no unscoped SUCCESS IngestionRun
  │       (always re-fetches the current month and last complete month)
  ├─ Dev (_dev DAG, generated rows via _finance_ingest_dev_data):
  │    GET /api/v1/public-cloud/products (accountId per product) → invent amounts in the DAG (no cloud APIs)
  ├─ Test / prod: AWS Cost Explorer (LZA) + Azure Cost Management
  └─ Keycloak client_credentials (finance SA)
       └─ POST /api/public-cloud/finance/ingest/lines
            └─ Registry persist (same path for generated and live lines)
```

-   **Airflow** holds AWS/Azure billing credentials. KubernetesExecutor task pods inherit `airflow-variables`.
-   **Registry app** holds session secrets and Airflow API creds (to queue the DAG). It must **not** have `AWS_ACCESS_KEY_ID`, Azure SP, or `FINANCE_AZURE_COST_SCOPE`.
-   Never commit secrets, account IDs, or service-principal passwords to git.

### Credential resolution

| Provider | Airflow worker                                                                             |
| -------- | ------------------------------------------------------------------------------------------ |
| AWS_LZA  | Default AWS credential chain (`AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY`)               |
| Azure    | `ClientSecretCredential` via `AZURE_CLIENT_ID` / `AZURE_TENANT_ID` / `AZURE_CLIENT_SECRET` |

Subscription / account IDs for joins come from product metadata (`azureSubscriptions`, `awsAccounts`, `billingAccountLinks`).

### AWS LZA (Cost Explorer)

| Item      | Plan                                                                                    |
| --------- | --------------------------------------------------------------------------------------- |
| Principal | Dedicated IAM user or role with Cost Explorer / billing-read across LZA linked accounts |
| Scope     | AWS_LZA estate only (classic AWS is out of scope)                                       |

**`airflow-variables` keys:**

| Env var                 | Purpose                                                                            |
| ----------------------- | ---------------------------------------------------------------------------------- |
| `AWS_ACCESS_KEY_ID`     | LZA billing-read access key                                                        |
| `AWS_SECRET_ACCESS_KEY` | Matching secret                                                                    |
| `FINANCE_AWS_REGION`    | Cost Explorer endpoint only (`us-east-1`). Do not use `AWS_REGION` for this client |

Cost Explorer ingest is one monthly `GetCostAndUsage` (account × service), paginated. Linked-account allowlists are chunked so a filter cannot overflow the CE dimension limit.

### Azure (Cost Management)

| Item        | Plan                                                            |
| ----------- | --------------------------------------------------------------- |
| Principal   | Entra ID app registration (service principal)                   |
| Permissions | Cost Management Reader (or equivalent) on the estate cost scope |

**`airflow-variables` keys:**

| Env var                    | Purpose                                                                                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AZURE_TENANT_ID`          | Entra tenant                                                                                                                                            |
| `AZURE_CLIENT_ID`          | App registration (application) ID                                                                                                                       |
| `AZURE_CLIENT_SECRET`      | Client secret                                                                                                                                           |
| `FINANCE_AZURE_COST_SCOPE` | ARM scope for **one** estate Query, e.g. `/providers/Microsoft.Management/managementGroups/{id}` or `/providers/Microsoft.Billing/billingAccounts/{id}` |

Subscription IDs come from product metadata, not from secrets.

**Rate limits.** Estate ingest **requires** `FINANCE_AZURE_COST_SCOPE`. If that scope is unset or returns 400/401/403/404, ingest fails instead of walking every subscription. Queries send `ClientType: bcgov-platform-services-registry`, retry 429/5xx, and honor `Retry-After`. The DAG `execution_timeout` is 20 minutes. Admins queue the same DAG from the finance snapshot (**Ingest missing months**).

### Airflow → registry auth

Airflow authenticates to `POST /ingest/lines` with a **Keycloak team service account** (`client_credentials`).

The Keycloak client must be configured as:

-   `service_account_type` claim: `team`
-   `roles` claim: `public-admin`

| Env (Airflow / `airflow-variables`) | Purpose                                          |
| ----------------------------------- | ------------------------------------------------ |
| `DEV_FINANCE_SA_ID` / `_SECRET`     | Dev (local compose sets these to the sandbox SA) |
| `TEST_FINANCE_SA_ID` / `_SECRET`    | Test (local compose also sets these)             |
| `PROD_FINANCE_SA_ID` / `_SECRET`    | Prod                                             |

### Registry → Airflow (snapshot button)

**Ingest missing months** always queues the environment DAG. The app needs Airflow API reachability, **not** AWS/Azure keys.

| Env (app / `.env.local`) | Purpose                                       |
| ------------------------ | --------------------------------------------- |
| `AIRFLOW_API_URL`        | Airflow API base                              |
| `AIRFLOW_API_USERNAME`   | Airflow user that can trigger the finance DAG |
| `AIRFLOW_API_PASSWORD`   | Matching password                             |
| `AIRFLOW_FINANCE_DAG_ID` | Optional override; defaults from `APP_ENV`    |

### Environment configuration (dev / test / prod)

Do this in **each** registry environment. Dev does not get real billing credentials.

**Every environment**

1. In the Registry UI (`/team-api-accounts`), create a team service account with `public-admin`. Copy the client id and secret.
2. Put that pair in the tools `airflow-variables` secret as `{DEV,TEST,PROD}_FINANCE_SA_ID` / `_SECRET`.
3. Put `AIRFLOW_API_URL`, `AIRFLOW_API_USERNAME`, and `AIRFLOW_API_PASSWORD` on the **app** Vault path so the snapshot button can queue the DAG. Do **not** put AWS or Azure billing keys on the app pod.
4. Unpause that environment’s DAG in the tools Airflow UI (`secdash-airflow`).

**Dev only**

-   No AWS / Azure keys and no `FINANCE_AZURE_COST_SCOPE`. `_dev` reads product `accountId` links from the v1 products API and invents amounts in the DAG.
-   Finance preview is already on (`APP_ENV=dev`).

**Test and prod (real billing)**

1. Create an AWS LZA billing-read principal and an Azure Cost Management Reader SP.
2. Add to `airflow-variables`: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `FINANCE_AWS_REGION=us-east-1`, `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `FINANCE_AZURE_COST_SCOPE`.
3. Unpause `_test` / `_prod` only after the Azure scope is set.
4. **Prod UI:** set `PUBLIC_CLOUD_FINANCE_PREVIEW=true` on the app Vault path (dev and test are already on).

**Local**

-   `make local-airflow` loads both `_dev` and `_test` against the local registry with the sandbox provision SA (`provision-service-account-id` / `testsecret`).
-   Default (`_dev`): generated rows, no cloud keys.
-   Real Forge (`_test`): `AIRFLOW_FINANCE_DAG_ID=public_cloud_finance_ingest_test`, `AWS_PROFILE`, and `FINANCE_AZURE_COST_SCOPE` in `.env.local`; seed plates with `pnpm seed-forge-finance-local`.

### Rollout checklist

1. Dev: team SA + `DEV_FINANCE_SA_*` + app `AIRFLOW_API_*`; unpause `_dev` (generated rows, no cloud keys).
2. Test: team SA + `TEST_FINANCE_SA_*` + AWS/Azure keys + `FINANCE_AZURE_COST_SCOPE`; unpause `_test`.
3. Prod: same as test with `PROD_*`, plus `PUBLIC_CLOUD_FINANCE_PREVIEW=true` on the app.
4. Rotate SP and SA secrets on the usual platform schedule.

### Explicit non-goals

-   AWS/Azure billing credentials on the registry app
-   In-app or CLI billing fetch (Airflow `_dev` invents amounts on v1 product `accountId` links only)
-   Provider credentials in Airflow DAG code or GitHub Actions
-   Classic AWS native account storage or any real classic-AWS ingest
-   Per-subscription Azure fallback in Airflow (estate scope only)

## FOIPPA

Variance notes are free text, append-only, with author and timestamp. They are excluded from all exports.
