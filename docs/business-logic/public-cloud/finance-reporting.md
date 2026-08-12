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

## FOIPPA

Variance notes are free text, append-only, with author and timestamp. They are excluded from all exports.
