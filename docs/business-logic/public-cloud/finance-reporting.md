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

Local live ingest uses interactive developer auth (AWS SSO profile / `az login`). That is **not** the Test/Prod model.

### Architecture

```
Airflow (schedule)
  └─ POST /api/public-cloud/finance/ingest  (+ registry service token)
       └─ Registry app pod
            ├─ AWS Cost Explorer (LZA)     ← credentials from Vault
            └─ Azure Cost Management       ← credentials from Vault
```

-   **Airflow** does not hold AWS/Azure billing credentials. It only triggers the registry API.
-   **Registry app** (Test/Prod) holds provider credentials via the existing Vault injector pattern (`helm/main` vault annotations).
-   **Dev** stays on simulated actuals; no provider secrets required.
-   Never commit secrets, account IDs, or service-principal passwords to git. GitHub Actions does not receive these credentials.

### AWS LZA (Cost Explorer)

| Item        | Plan                                                                                    |
| ----------- | --------------------------------------------------------------------------------------- |
| Principal   | Dedicated IAM user or role with Cost Explorer / billing-read across LZA linked accounts |
| Scope       | AWS_LZA estate only (classic AWS is out of scope for scheduled ingest)                  |
| Local today | `FINANCE_AWS_PROFILE` / SSO                                                             |
| Test/Prod   | Default credential chain from Vault-injected env (not an interactive SSO profile)       |

**Vault keys to add (Test, then Prod):**

| Env var                              | Purpose                                      |
| ------------------------------------ | -------------------------------------------- |
| `AWS_ACCESS_KEY_ID`                  | LZA billing-read access key                  |
| `AWS_SECRET_ACCESS_KEY`              | Matching secret                              |
| `AWS_REGION` or `FINANCE_AWS_REGION` | Prefer `ca-central-1`                        |
| `FINANCE_LIVE_BILLING`               | Set `api` so the app uses live Cost Explorer |

Optional later: replace static keys with IRSA / assume-role (`AWS_ROLE_ARN`) if platform standards prefer that.

### Azure (Cost Management)

| Item        | Plan                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------- |
| Principal   | Entra ID app registration (service principal)                                             |
| Permissions | Cost Management Reader (or equivalent) on subscriptions we ingest                         |
| Local today | `az login` + `az rest`                                                                    |
| Test/Prod   | Service principal env vars from Vault; adapters will use SP tokens (not interactive `az`) |

**Vault keys to add (Test, then Prod):**

| Env var                | Purpose                                        |
| ---------------------- | ---------------------------------------------- |
| `AZURE_TENANT_ID`      | Entra tenant                                   |
| `AZURE_CLIENT_ID`      | App registration (application) ID              |
| `AZURE_CLIENT_SECRET`  | Client secret                                  |
| `FINANCE_LIVE_BILLING` | Set `api` so the app uses live Cost Management |

Subscription IDs come from product metadata (`azureSubscriptions` / `billingAccountLinks`), not from Vault.

### Airflow → registry auth

Separate from provider billing secrets. Airflow needs a token/header to call the ingest API:

| Env (Airflow)                     | Purpose                                       |
| --------------------------------- | --------------------------------------------- |
| `TEST_FINANCE_INGEST_AUTH_HEADER` | Authorization header for Test registry ingest |
| `PROD_FINANCE_INGEST_AUTH_HEADER` | Authorization header for Prod registry ingest |

Store these in Airflow/Vault for the tools namespace. Prefer a dedicated service account for ingest (not a personal admin session).

### Rollout checklist

1. Create AWS LZA billing-read principal and Azure service principal (Test first).
2. Grant Cost Explorer / Cost Management read on the required accounts and subscriptions.
3. Add the env vars above to Vault for the Test app path; confirm the pod receives them.
4. Confirm adapters use env/SP credentials in cluster (no SSO profile / no `az login`).
5. Set Airflow ingest auth header; unpause `public_cloud_finance_ingest_test`.
6. Repeat for Prod after Test looks healthy.
7. Rotate SP secrets on the usual platform schedule; update Vault only.

### Explicit non-goals

-   Provider credentials in Airflow DAG code or GitHub Actions
-   Interactive SSO / `az login` inside cluster pods
-   Classic AWS native account storage or scheduled classic-AWS ingest in this prototype

## FOIPPA

Variance notes are free text, append-only, with author and timestamp. They are excluded from all exports.
