# Admin Tools

These tools are command-line entrypoints that live in the app codebase and reuse the app's shared framework pieces such as Prisma, validation, includes, and logging.

Run all commands from the repo root with `pnpm --dir app run ...`.

## What These Tools Are For

There are three main jobs here:

1. Bootstrap new `System` and `Team` records from existing registry products.
2. Find likely duplicate or related `System` and `Team` clusters for review.
3. Consolidate reviewed clusters into brand new `System` or `Team` records while archiving the source records.
4. Backfill derived fields such as `originKind` onto existing records after the model evolves.
5. Analyze external import sources before creating new records from them.

## Typical Workflow

The normal operating flow is:

1. Bootstrap `System` records from existing public/private cloud products.
2. Bootstrap `Team` records from existing public/private cloud products.
3. Analyze any external import sources to understand how new `System` / `Team` records will map and correlate.
4. Backfill `originKind` on existing `System` / `Team` records if you need sorting/filtering to reflect provenance in the UI.
5. Generate `System` merge candidates.
6. Review the generated `System` JSON / Markdown and, if useful, edit suggested names.
7. Run `System` consolidation in `--dry-run` mode.
8. Run `System` consolidation for real.
9. Generate `Team` merge candidates.
10. Review the generated `Team` CSV / JSON / Markdown and edit suggested names in the CSV if needed.
11. Resync the `Team` JSON / Markdown from the reviewed CSV if needed.
12. Run `Team` consolidation in `--dry-run` mode.
13. Run `Team` consolidation for real.

## Quick Guide

Use these tools when:

-   `create-system-from-...`
    Use when you want to seed new `System` records from existing product records.
-   `create-team-from-...`
    Use when you want to seed new `Team` records from existing product records.
-   `find-system-merge-candidates`
    Use when you want to discover likely duplicate/related `System` clusters.
-   `find-team-merge-candidates`
    Use when you want to discover likely duplicate/related `Team` clusters.
-   `analyze-division-import-sources`
    Use when you want to inspect the `division_apps.csv` and `division_staff.csv` files, see how they map to proposed `System` / `Team` imports, and identify collisions with Systems already in the registry before importing anything.
-   `import-division-sources`
    Use when you want to actually create imported `System` and `Team` records from the division CSV files, with provenance metadata, idempotent reruns, and Team-to-System links.
-   `check-consolidation-metadata`
    Use when you want to verify whether Systems and Teams in the database actually have `metadata.consolidation` or `metadata.consolidatedInto` populated, and inspect a few sample records.
-   `find-cloud-products-with-security-data`
    Use when you want to identify private or public cloud products that have populated repository links, Sonar scan results, ACS results, or ZAP results backing the Security views.
-   `suggest-organization-mappings-for-imported-systems`
    Use when you want to inspect imported division-backed Systems, extract unique source values from their original metadata, and produce a review table with best-guess Organization mappings from the existing organization table.
-   `apply-organization-mappings-to-imported-systems`
    Use when you have reviewed the imported-system organization mapping CSV and want to patch `system.organizationId` on imported Systems based on the `bestGuessOrganizationCode` column.
-   `backfill-origin-kind`
    Use when existing `System` or `Team` rows have correct provenance in metadata, but their stored `originKind` values need to be derived and written in bulk for UI filtering/sorting.
-   `merge-systems-from-candidates`
    Use when you want to create brand new consolidated `System` records from reviewed candidate clusters.
-   `merge-teams-from-candidates`
    Use when you want to create brand new consolidated `Team` records from reviewed candidate clusters.

## Output Files

The candidate-finder tools write review artifacts under:

`app/app/admin-tools/output/`

File types:

-   `.json`
    Machine-readable input for the consolidation tools.
-   `.md`
    Human-readable review summary.
-   `.csv`
    Human-friendly spreadsheet review surface for Team candidate runs.

## Bootstrap Tools

### Create system from public cloud product

Creates `System` records from existing public cloud products, copies top-level product metadata into the new system, adds provenance metadata for traceability, and links the new system back to the source product.

Single product:

```sh
pnpm --dir app run admin-tool:create-system-from-public-cloud-product -- --licence-plate abc123
```

All public cloud products:

```sh
pnpm --dir app run admin-tool:create-system-from-public-cloud-product
```

### Create system from private cloud product

Creates `System` records from existing private cloud products using the same bootstrap/provenance approach.

Single product:

```sh
pnpm --dir app run admin-tool:create-system-from-private-cloud-product -- --licence-plate abc123
```

All private cloud products:

```sh
pnpm --dir app run admin-tool:create-system-from-private-cloud-product
```

### Create team from public cloud product

Creates `Team` records from existing public cloud products, derives a team name like `<Product Name> Team`, copies product membership into the new team's `members` list, links the team back to the product, and links it to the corresponding bootstrapped `System`.

Single product:

```sh
pnpm --dir app run admin-tool:create-team-from-public-cloud-product -- --licence-plate abc123
```

All public cloud products:

```sh
pnpm --dir app run admin-tool:create-team-from-public-cloud-product
```

### Create team from private cloud product

Creates `Team` records from existing private cloud products using the same bootstrap/provenance approach.

Single product:

```sh
pnpm --dir app run admin-tool:create-team-from-private-cloud-product -- --licence-plate abc123
```

All private cloud products:

```sh
pnpm --dir app run admin-tool:create-team-from-private-cloud-product
```

## Candidate Finder Tools

### Find system merge candidates

Scans existing `System` records, scores pairwise similarity using system names plus supporting signals such as shared organization, linked teams, overlapping team members, and linked resource names, then emits proposed merge clusters.

Notes:

-   Archived Systems are ignored.
-   The current matching pass is focused on the imported division-backed System set, identified by `originKind = IMPORTED_OTHER`.
-   Similarity is scored across the full active System set, but the emitted clusters must include at least one imported System from that focused set.
-   The tool supports `--mode division-import` for deduping newly imported Systems against the existing registry. In that mode, when an imported System is involved, team/member/resource linkage signals are suppressed, name-based similarity is weighted more heavily, and organization mismatches are not treated as an automatic blocker.

This writes JSON and Markdown review artifacts.

Default run:

```sh
pnpm --dir app run admin-tool:find-system-merge-candidates
```

Optional flags:

```sh
pnpm --dir app run admin-tool:find-system-merge-candidates -- --min-score 0.68 --limit 25
pnpm --dir app run admin-tool:find-system-merge-candidates -- --json-out app/app/admin-tools/output/system-candidates.json --md-out app/app/admin-tools/output/system-candidates.md
pnpm --dir app run admin-tool:find-system-merge-candidates -- --mode division-import
```

### Find team merge candidates

Scans existing `Team` records and groups candidate duplicate teams by exact matching of the full `PROJECT_OWNER` and `PRIMARY_TECHNICAL_LEAD` member sets.

Notes:

-   Teams missing either core role are excluded.
-   Team names are not used to detect matches.
-   The output includes a suggested new team name, a non-core member score, the union of linked systems/resources, and a suggested consolidated member set.

This writes JSON, Markdown, and CSV review artifacts.

Default run:

```sh
pnpm --dir app run admin-tool:find-team-merge-candidates
```

Optional flags:

```sh
pnpm --dir app run admin-tool:find-team-merge-candidates -- --limit 25
pnpm --dir app run admin-tool:find-team-merge-candidates -- --json-out app/app/admin-tools/output/team-candidates.json --md-out app/app/admin-tools/output/team-candidates.md
pnpm --dir app run admin-tool:find-team-merge-candidates -- --csv-out app/app/admin-tools/output/team-candidates.csv
```

## Backfill Tools

### Backfill originKind on Systems and Teams

Scans existing `System` and `Team` records, derives the correct `originKind` from existing metadata such as bootstrap provenance and consolidation markers, and writes the derived value back onto the record.

Use this when:

-   older records were created before `originKind` existed
-   records defaulted to `MANUAL` even though their metadata shows they were bootstrapped or consolidated
-   you want UI filtering/sorting by origin to reflect the actual provenance

By default, this processes both `System` and `Team` records.

Dry run:

```sh
pnpm --dir app run admin-tool:backfill-origin-kind -- --dry-run
```

Only systems:

```sh
pnpm --dir app run admin-tool:backfill-origin-kind -- --systems
```

Only teams:

```sh
pnpm --dir app run admin-tool:backfill-origin-kind -- --teams
```

### Check consolidation metadata on Systems and Teams

Queries the database and reports:

-   how many `System` rows have `metadata.consolidation`
-   how many `System` rows have `metadata.consolidatedInto`
-   how many `Team` rows have `metadata.consolidation`
-   how many `Team` rows have `metadata.consolidatedInto`
-   a small sample of each category

This tool is read-only with respect to database records.

Default run:

```sh
pnpm --dir app run admin-tool:check-consolidation-metadata
```

Optional flags:

```sh
pnpm --dir app run admin-tool:check-consolidation-metadata -- --limit 20
```

### Find cloud products with Security data

Scans both private and public cloud products and identifies products that currently have backing data for any of:

-   repositories (`SecurityConfig`)
-   Sonar scan results (`SonarScanResult`)
-   ACS results (`AcsResult`)
-   ZAP results (`PrivateCloudProductZapResult`, private cloud only)

This tool is read-only and writes CSV, JSON, and Markdown reports under `app/admin-tools/output/`.

Important notes:

-   ACS results are keyed by licence plate only in the current schema, so this report matches ACS rows to both private/public products by licence plate.
-   ZAP results currently have a private-cloud-specific model only. Public cloud products will therefore report that no dedicated public-cloud ZAP model exists.

Default run:

```sh
pnpm --dir app run admin-tool:find-cloud-products-with-security-data
```

Optional flags:

```sh
pnpm --dir app run admin-tool:find-cloud-products-with-security-data -- --csv-out app/admin-tools/output/cloud-security-data.csv
pnpm --dir app run admin-tool:find-cloud-products-with-security-data -- --json-out app/admin-tools/output/cloud-security-data.json --md-out app/admin-tools/output/cloud-security-data.md
```

### Suggest Organization mappings for imported Systems

Scans active imported Systems (`originKind = IMPORTED_OTHER`) that were created from the division app CSV import and extracts unique values from `Ministry/Sector Acronym` in the original source row stored in metadata.

For each unique acronym value, the tool scores likely matches against the existing `Organization` table and writes a review artifact containing:

-   the imported source field/value
-   how many imported Systems carry that value
-   sample imported Systems using it
-   the best-guess Organization id/code/name
-   alternates and scoring rationale

This tool is read-only with respect to database records.

Default run:

```sh
pnpm --dir app run admin-tool:suggest-organization-mappings-for-imported-systems
```

Optional flags:

```sh
pnpm --dir app run admin-tool:suggest-organization-mappings-for-imported-systems -- --sample-limit 10
pnpm --dir app run admin-tool:suggest-organization-mappings-for-imported-systems -- --csv-out app/admin-tools/output/imported-system-org-mapping.csv --json-out app/admin-tools/output/imported-system-org-mapping.json --md-out app/admin-tools/output/imported-system-org-mapping.md
```

### Apply reviewed Organization mappings to imported Systems

Reads a reviewed imported-system organization mapping CSV and patches `organizationId` on imported Systems by:

-   reading each imported System's original `Ministry/Sector Acronym` from metadata
-   matching that acronym to a row in the reviewed CSV
-   resolving `bestGuessOrganizationCode` to an actual `Organization` row in the database
-   updating the matching imported Systems

The tool only uses:

-   `sourceField = Ministry/Sector Acronym`
-   `bestGuessOrganizationCode`

If no `--input` is provided, it uses the newest `imported-system-org-mapping-*.csv` file in `app/admin-tools/output/`.

Use `--dry-run` first.

Default dry run:

```sh
pnpm --dir app run admin-tool:apply-organization-mappings-to-imported-systems -- --dry-run
```

Run for real:

```sh
pnpm --dir app run admin-tool:apply-organization-mappings-to-imported-systems
```

Optional flags:

```sh
pnpm --dir app run admin-tool:apply-organization-mappings-to-imported-systems -- --input app/admin-tools/output/imported-system-org-mapping.csv --dry-run
pnpm --dir app run admin-tool:apply-organization-mappings-to-imported-systems -- --clear-missing
```

Notes:

-   `--clear-missing` will set `organizationId = null` for imported Systems whose mapping row exists but has an empty `bestGuessOrganizationCode`.
-   Systems with no matching CSV row or no matching Organization code in the database are skipped and reported.

## Import Analysis Tools

### Analyze division app/staff CSV import sources

Reads:

-   `app/admin-tools/input/division_apps.csv`
-   `app/admin-tools/input/division_staff.csv`

and produces a read-only analysis of how those files could map into new `System` and `Team` records.

What it does:

-   proposes one `System` import per app row
-   proposes one `Team` import per normalized staff assignment target
-   correlates staff assignments to apps using:
    -   staff `Ass1 UniqueID`
    -   app `Unique ID`
-   flags staff rows that do not map cleanly to an app
-   flags app rows whose `Unique ID` is duplicated across multiple app rows
-   compares proposed imported Systems against existing registry Systems using exact normalized-name and root-token matches
-   writes JSON, Markdown, and CSV review artifacts

This tool is read-only with respect to database records.

Default run:

```sh
pnpm --dir app run admin-tool:analyze-division-import-sources
```

Optional flags:

```sh
pnpm --dir app run admin-tool:analyze-division-import-sources -- --apps-csv app/admin-tools/input/division_apps.csv --staff-csv app/admin-tools/input/division_staff.csv
pnpm --dir app run admin-tool:analyze-division-import-sources -- --json-out app/admin-tools/output/division-import-analysis.json --md-out app/admin-tools/output/division-import-analysis.md --csv-out app/admin-tools/output/division-import-review.csv
```

Outputs:

-   `.json`
    Complete machine-readable analysis report
-   `.md`
    Human-readable summary of mapping/correlation issues
-   `.csv`
    Review surface for proposed System imports and potential existing-registry collisions

### Import Systems and Teams from division CSV sources

Reads:

-   `app/admin-tools/input/division_apps.csv`
-   `app/admin-tools/input/division_staff.csv`

and creates imported `System` and `Team` records from those sources.

What it does:

-   imports one `System` per app row unless:
    -   that source row was already imported before
    -   an exact existing active `System` name match is reused
    -   a potential fuzzy collision with an existing `System` requires review and is skipped
-   imports one `Team` per normalized staff assignment target
-   links imported Teams to the imported or reused Systems that correspond to the matching app `Unique ID`
-   resolves Team members against existing registry `User` records by email first, then unique full-name match
-   preserves unresolved staff-member rows in Team metadata for later cleanup
-   writes a JSON summary report for the run

This tool mutates database records. Use `--dry-run` first.

Default run:

```sh
pnpm --dir app run admin-tool:import-division-sources -- --dry-run
```

Run for real:

```sh
pnpm --dir app run admin-tool:import-division-sources
```

Only import Systems:

```sh
pnpm --dir app run admin-tool:import-division-sources -- --systems-only
```

Only import Teams:

```sh
pnpm --dir app run admin-tool:import-division-sources -- --teams-only
```

Optional flags:

```sh
pnpm --dir app run admin-tool:import-division-sources -- --apps-csv app/admin-tools/input/division_apps.csv --staff-csv app/admin-tools/input/division_staff.csv
pnpm --dir app run admin-tool:import-division-sources -- --json-out app/admin-tools/output/division-import-run.json
```

## Consolidation Tools

### Merge systems from candidate clusters

Reads a `System` merge-candidate JSON file, selects clusters by explicit id, id range, score threshold, or any union of those selectors, then consolidates each selected cluster into a brand new `System`.

What happens:

-   a brand new consolidated `System` is created
-   all Team and Product links move to the new `System`
-   source `System` records are archived
-   links are removed from the archived `System` records
-   provenance metadata is written to both the new and archived records

Dry run:

```sh
pnpm --dir app run admin-tool:merge-systems-from-candidates -- --input app/app/admin-tools/output/system-merge-candidates.json --cluster-id cluster-001 --dry-run
```

Examples:

```sh
pnpm --dir app run admin-tool:merge-systems-from-candidates -- --input app/app/admin-tools/output/system-merge-candidates.json --cluster-id cluster-023
pnpm --dir app run admin-tool:merge-systems-from-candidates -- --input app/app/admin-tools/output/system-merge-candidates.json --cluster-range cluster-001:cluster-012
pnpm --dir app run admin-tool:merge-systems-from-candidates -- --input app/app/admin-tools/output/system-merge-candidates.json --min-score 0.82
```

### Merge teams from candidate clusters

Reads a `Team` merge-candidate JSON file, selects clusters by explicit id, id range, non-core member score threshold, or any union of those selectors, then consolidates each selected cluster into a brand new `Team`.

What happens:

-   a brand new consolidated `Team` is created
-   `suggestedMembers` from the JSON are used as the new Team membership
-   all System and Product links move to the new `Team`
-   source `Team` records are archived
-   links are removed from the archived `Team` records
-   provenance metadata is written to both the new and archived records

Dry run:

```sh
pnpm --dir app run admin-tool:merge-teams-from-candidates -- --input app/app/admin-tools/output/team-merge-candidates.json --cluster-id cluster-001 --dry-run
```

Examples:

```sh
pnpm --dir app run admin-tool:merge-teams-from-candidates -- --input app/app/admin-tools/output/team-merge-candidates.json --cluster-id cluster-023
pnpm --dir app run admin-tool:merge-teams-from-candidates -- --input app/app/admin-tools/output/team-merge-candidates.json --cluster-range cluster-001:cluster-012
pnpm --dir app run admin-tool:merge-teams-from-candidates -- --input app/app/admin-tools/output/team-merge-candidates.json --min-score 0.82
```

## Safety Notes

-   The candidate-finder tools are read-only with respect to database records.
-   The consolidators support `--dry-run` and should usually be exercised that way first.
-   The consolidators create brand new consolidated records rather than mutating one source record into the survivor.
-   Source records are archived, not deleted.
-   Both consolidation tools continue through failures and report a summary at the end.
