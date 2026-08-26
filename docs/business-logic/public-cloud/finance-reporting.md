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

Billing lines that cannot be matched go to `UnmatchedBillingLine` and are excluded from per-product figures. Never silently dropped.

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

Months before that start are out of scope (`—`, not incomplete). After a successful provider-month ingest, products that existed in that month get a rollup, including **$0** when they had no billing lines. Estate FYTD coverage only expects elapsed months where at least one in-scope product existed. Scheduled backfill stays at `IngestionRun` grain and still re-runs failed estate months.

## FX (USD → CAD)

AWS Cost Explorer amounts are typically USD. At ingest time for a billing month (invoice / month-end), the registry:

1. Loads or creates a `MonthlyFxRate` row for `USD_CAD` × year × month
2. Fetches Bank of Canada Valet `FXUSDCAD` for that calendar month and stores the **last** observation (closest business day to month-end)
3. Converts line amounts with that historical rate and records `fxRate` / `fxRateDate` on each spend row

If Valet is unreachable, ingest may fall back to `FINANCE_USD_CAD_RATE` and still persist that value as the month’s rate (source marked accordingly). Prefer fixing network access over relying on the env default.

## Actuals by environment

| Environment                   | Billing source                                   |
| ----------------------------- | ------------------------------------------------ |
| Local / Dev (app default)     | Simulated (`pnpm seed-finance-local`)            |
| Local (opt-in live tests/CLI) | Real adapters for allowlisted plates — see below |
| Test / Prod                   | Real provider adapters via Airflow               |

### Local live ingest (opt-in)

Requires AWS SSO and/or `az login`. Do not commit real account IDs.

```bash
# .env.local (gitignored) or export for one run:
export FINANCE_LIVE_BILLING=api
export FINANCE_LIVE_TEST_LICENCE_PLATES=f82c1a,e71b0e
export FINANCE_LIVE_TEST_ACCOUNT_IDS=<12-digit-aws-account>,<azure-subscription-guid>
export FINANCE_AWS_PROFILE=lza-live-root-admin   # or your SSO profile
export AWS_PROFILE=$FINANCE_AWS_PROFILE
# Optional emergency fallback only — prefer Bank of Canada month-end rates:
# export FINANCE_USD_CAD_RATE=1.35

pnpm test:finance-live
```

These `*.live.test.ts` suites are excluded from default `pnpm test` / GitHub Actions (no cloud permissions in CI). They also hard-skip when `CI` or `GITHUB_ACTIONS` is set.

Live adapters:

-   **AWS:** Cost Explorer via `@aws-sdk` + SSO profile
-   **Azure:** Cost Management query via `az rest` (uses current `az login`)

Optional file-export fallback still works with `FINANCE_AWS_COST_EXPORT_PATH` / `FINANCE_AZURE_COST_EXPORT_PATH` when `FINANCE_LIVE_BILLING` is unset.

## Provider credentials & Vault (Test / Prod)

Local live ingest keeps interactive developer auth (AWS SSO profile / `az login`). Test/Prod uses Vault-injected service principals. Both paths are wired in the real billing adapters.

### Architecture

```
Airflow (schedule)
  └─ Keycloak client_credentials (finance SA)
       └─ POST /api/public-cloud/finance/ingest
            └─ Registry app pod
                 ├─ AWS Cost Explorer (LZA)     ← credentials from Vault
                 └─ Azure Cost Management       ← credentials from Vault
```

-   **Airflow** holds only the Keycloak finance SA id/secret (tools Vault). It does not hold AWS/Azure billing credentials.
-   **Registry app** (Test/Prod) holds provider credentials via the existing Vault injector pattern (`helm/_app/templates/deployment.yaml`). Keys must exist in the app Vault path **and** be listed in that inject template or the pod never sees them.
-   **Dev** stays on simulated actuals; no provider secrets required.
-   **Local live** still uses CLI creds (`FINANCE_AWS_PROFILE` / `az login`) for `pnpm test:finance-live`.
-   Never commit secrets, account IDs, or service-principal passwords to git. GitHub Actions does not receive these credentials.

### Credential resolution (implemented)

| Provider | Local (CLI)                                                            | Test / Prod (Vault)                                                                                  |
| -------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| AWS_LZA  | `FINANCE_AWS_PROFILE` / `AWS_PROFILE` → shared/SSO profile             | Default AWS credential chain (`AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY`, or IRSA/`AWS_ROLE_ARN`) |
| Azure    | `DefaultAzureCredential` (picks up `az login`) with `az rest` fallback | `DefaultAzureCredential` via `AZURE_CLIENT_ID` / `AZURE_TENANT_ID` / `AZURE_CLIENT_SECRET`           |

Subscription / account IDs for joins come from product metadata (`azureSubscriptions`, `awsAccounts`, `billingAccountLinks`). `FINANCE_LIVE_TEST_ACCOUNT_IDS` is only for the opt-in live test suite (`pnpm test:finance-live`); it is not an estate ingest allowlist.

### AWS LZA (Cost Explorer)

| Item      | Plan                                                                                    |
| --------- | --------------------------------------------------------------------------------------- |
| Principal | Dedicated IAM user or role with Cost Explorer / billing-read across LZA linked accounts |
| Scope     | AWS_LZA estate only (classic AWS is out of scope for scheduled ingest)                  |
| Local     | `FINANCE_AWS_PROFILE` / SSO                                                             |
| Test/Prod | Vault-injected keys (or role) on the app pod                                            |

**Vault keys to add (Test, then Prod):**

| Env var                              | Purpose                                                                          |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| `AWS_ACCESS_KEY_ID`                  | LZA billing-read access key                                                      |
| `AWS_SECRET_ACCESS_KEY`              | Matching secret                                                                  |
| `AWS_REGION` or `FINANCE_AWS_REGION` | Prefer `ca-central-1`                                                            |
| `FINANCE_LIVE_BILLING`               | Optional; set `api` to force live adapters (also auto when AWS keys are present) |

Cost Explorer ingest is one monthly `GetCostAndUsage` (account × service), paginated, with the AWS SDK adaptive retry mode. Linked-account allowlists are chunked so a live test filter cannot overflow the CE dimension limit.

Optional later: replace static keys with IRSA / assume-role (`AWS_ROLE_ARN`) if platform standards prefer that.

### Azure (Cost Management)

| Item        | Plan                                                              |
| ----------- | ----------------------------------------------------------------- |
| Principal   | Entra ID app registration (service principal)                     |
| Permissions | Cost Management Reader (or equivalent) on subscriptions we ingest |
| Local       | `az login` (DefaultAzureCredential / `az rest` fallback)          |
| Test/Prod   | SP env vars from Vault                                            |

**Vault keys to add (Test, then Prod):**

| Env var                    | Purpose                                                                                                                                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `AZURE_TENANT_ID`          | Entra tenant                                                                                                                                                                                           |
| `AZURE_CLIENT_ID`          | App registration (application) ID                                                                                                                                                                      |
| `AZURE_CLIENT_SECRET`      | Client secret                                                                                                                                                                                          |
| `FINANCE_LIVE_BILLING`     | Optional; set `api` to force live adapters (also auto when SP env is present)                                                                                                                          |
| `FINANCE_AZURE_COST_SCOPE` | Optional ARM scope for **one** estate Query (billing account or management group), e.g. `/providers/Microsoft.Management/managementGroups/{id}` or `/providers/Microsoft.Billing/billingAccounts/{id}` |

Subscription IDs come from product metadata (`azureSubscriptions` / `billingAccountLinks`), not from Vault.

**Rate limits.** Azure Cost Management Query is the tight quota (~20 calls / minute per tenant). Scheduled / estate ingest **requires** `FINANCE_AZURE_COST_SCOPE` (one call grouped by `SubscriptionId` + `ServiceName`, then filtered to known products). If that scope is unset or returns 400/401/403/404, estate ingest fails instead of walking every subscription. Scoped live tests may still fall back to sequential per-subscription queries paced at 4s. Queries send a unique `ClientType` header, retry 429/5xx, and honor `Retry-After` / `retry-after-ms`. Pages follow `nextLink`. Bank of Canada Valet uses the same HTTP retry helper. Airflow waits 600s per provider-month, retries the DAG twice, and backfills any earlier FY month with no successful `IngestionRun`. Admins can run the same plan from the finance snapshot (**Ingest missing months**).

### Airflow → registry auth

Separate from provider billing secrets. Airflow authenticates to the ingest API with a **Keycloak team service account** (`client_credentials`), same pattern as the provisioner DAGs (`_keycloak.Keycloak`).

The Keycloak client must be configured as:

-   `service_account_type` claim: `team`
-   `roles` claim: `public-admin` (comma-separated if more roles are added later)

The ingest route accepts `service-account` + `public-admin` (or a human `admin` / `public-admin` cookie session for manual runs).

| Env (Airflow / tools Vault) | Purpose                                       |
| --------------------------- | --------------------------------------------- |
| `DEV_FINANCE_SA_ID`         | Keycloak client id for Dev finance ingest SA  |
| `DEV_FINANCE_SA_SECRET`     | Keycloak client secret for Dev                |
| `TEST_FINANCE_SA_ID`        | Keycloak client id for Test finance ingest SA |
| `TEST_FINANCE_SA_SECRET`    | Keycloak client secret for Test               |
| `PROD_FINANCE_SA_ID`        | Keycloak client id for Prod finance ingest SA |
| `PROD_FINANCE_SA_SECRET`    | Keycloak client secret for Prod               |

Create a dedicated SA client per environment (do not reuse a personal admin session or the provisioner SA unless ops deliberately shares one).

### Rollout checklist

1. Create AWS LZA billing-read principal and Azure service principal (Test first).
2. Grant Cost Explorer / Cost Management read on the required accounts and subscriptions.
3. Add the **app** provider env vars above to Vault for the Test app path; confirm the pod receives them.
4. Create the Keycloak finance SA (team + `public-admin` roles claim); store id/secret in tools Vault as `TEST_FINANCE_SA_*`.
5. Unpause `public_cloud_finance_ingest_test` after Airflow can read those env vars and `FINANCE_AZURE_COST_SCOPE` is set.
6. Repeat for Prod after Test looks healthy.
7. Rotate SP and SA secrets on the usual platform schedule; update Vault only.

### Explicit non-goals

-   Provider credentials in Airflow DAG code or GitHub Actions
-   Interactive SSO / `az login` inside cluster pods
-   Classic AWS native account storage or scheduled classic-AWS ingest in this prototype

## FOIPPA

Variance notes are free text, append-only, with author and timestamp. They are excluded from all exports.
