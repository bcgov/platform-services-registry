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

Months before that start are out of scope (`—`, not incomplete). After a successful provider-month ingest, products that existed in that month get a rollup, including **$0** when they had no billing lines. Estate FYTD coverage only expects elapsed months where at least one in-scope product existed. Snapshot service-line chips and rankings use the same complete-month set. Scheduled backfill stays at `IngestionRun` grain and still re-runs failed estate months.

Concurrent ingest of the same provider/month is blocked by `IngestionLock` (required unique `key`). A second persist returns **409** (not 500); Airflow retries that POST until the lock is free. Push that model before running ingest; drop any leftover `IngestionRun.ingestLockKey` unique index from the earlier optional-field lock.

## FX (USD → CAD)

AWS Cost Explorer amounts are typically USD. At ingest time for a billing month (invoice / month-end), the registry:

1. Loads or creates a `MonthlyFxRate` row for `USD_CAD` × year × month
2. Fetches Bank of Canada Valet `FXUSDCAD` for that calendar month and stores the **last** observation (closest business day to month-end)
3. Converts line amounts with that historical rate and records `fxRate` / `fxRateDate` on each spend row

If Valet is unreachable, ingest may fall back to `FINANCE_USD_CAD_RATE` and still persist that value as the month’s rate (source marked accordingly). Prefer fixing network access over relying on the env default.

## Actuals by environment

Every environment fetches billing in Airflow and persists via `POST /api/public-cloud/finance/ingest/lines`. The registry app never calls Cost Explorer or Cost Management.

| Environment | DAG                                 |
| ----------- | ----------------------------------- |
| Local       | `public_cloud_finance_ingest_local` |
| Dev         | `public_cloud_finance_ingest_dev`   |
| Test        | `public_cloud_finance_ingest_test`  |
| Prod        | `public_cloud_finance_ingest_prod`  |

Local Airflow is `make local-airflow` (port 8082, user `admin` / `admin`). That target sources `app/.env.local` and force-recreates the container. Set `AWS_PROFILE` and `FINANCE_AZURE_COST_SCOPE` there (do not commit real values). AWS uses host `~/.aws`; it checks SSO and tells you to `aws sso login --profile …` if expired. Azure loads `az account get-access-token` when `AZURE_ACCESS_TOKEN` is unset (`az login` first). The compose file sets `LOCAL_KEYCLOAK_AUTH_URL=http://keycloak:8080` and uses the sandbox provision SA. The local DAG ships in `helm/tools/dags` and stays paused in the tools cluster.

Local product seed is two modes. `pnpm seed-all-local` creates ~110 invented products for UI and forecast testing; ingest cannot join those IDs. `pnpm seed-forge-finance-local` seeds the Forge AWS / Azure test plates from `FINANCE_LIVE_TEST_LICENCE_PLATES` and `FINANCE_LIVE_TEST_ACCOUNT_IDS` in `.env.local`. Pass `--reset` on the Forge seed to drop the invented demo products first.

## Provider credentials

The **registry app does not fetch Azure or AWS billing**. Airflow task pods call Cost Explorer and Cost Management, then POST source-currency lines. The app converts USD→CAD, matches products, and writes spend / rollups / flags.

### Architecture

```
Airflow (schedule or snapshot "Ingest missing months")
  ├─ GET /api/public-cloud/finance/ingest/missing
  │    └─ current FY months through last complete month with no unscoped SUCCESS IngestionRun
  │       (always re-fetches the last complete month)
  ├─ AWS Cost Explorer (LZA)     ← keys in airflow-variables (or local env)
  ├─ Azure Cost Management       ← SP in airflow-variables (or local env)
  └─ Keycloak client_credentials (finance SA)
       └─ POST /api/public-cloud/finance/ingest/lines
            └─ Registry (persist + FX only)
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

| Env (Airflow / `airflow-variables`) | Purpose                 |
| ----------------------------------- | ----------------------- |
| `LOCAL_FINANCE_SA_ID` / `_SECRET`   | Local finance ingest SA |
| `DEV_FINANCE_SA_ID` / `_SECRET`     | Dev                     |
| `TEST_FINANCE_SA_ID` / `_SECRET`    | Test                    |
| `PROD_FINANCE_SA_ID` / `_SECRET`    | Prod                    |

### Registry → Airflow (snapshot button)

**Ingest missing months** always queues the environment DAG. The app needs Airflow API reachability, **not** AWS/Azure keys.

| Env (app / `.env.local`) | Purpose                                       |
| ------------------------ | --------------------------------------------- |
| `AIRFLOW_API_URL`        | Airflow API base                              |
| `AIRFLOW_API_USERNAME`   | Airflow user that can trigger the finance DAG |
| `AIRFLOW_API_PASSWORD`   | Matching password                             |
| `AIRFLOW_FINANCE_DAG_ID` | Optional override; defaults from `APP_ENV`    |

### Rollout checklist

1. Create AWS LZA billing-read principal and Azure service principal (Test first).
2. Grant Cost Explorer / Cost Management read on the required accounts and the Azure estate scope.
3. Add the provider env vars above to **`airflow-variables`**. Rebuild the Airflow image so `boto3` is installed.
4. Create the Keycloak finance SA (team + `public-admin`); store id/secret in `airflow-variables`.
5. Add `AIRFLOW_API_*` to the app Vault path (and `.env.local` for local). Confirm AWS/Azure finance keys are **not** on the app pod.
6. Unpause the environment DAG after `FINANCE_AZURE_COST_SCOPE` is set.
7. Rotate SP and SA secrets on the usual platform schedule.

### Explicit non-goals

-   AWS/Azure billing credentials on the registry app
-   In-app or CLI billing fetch (including simulated actuals)
-   Provider credentials in Airflow DAG code or GitHub Actions
-   Classic AWS native account storage or any real classic-AWS ingest
-   Per-subscription Azure fallback in Airflow (estate scope only)

## FOIPPA

Variance notes are free text, append-only, with author and timestamp. They are excluded from all exports.
