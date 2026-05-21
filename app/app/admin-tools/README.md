# Admin Tools

These tools are command-line entrypoints that live in the app codebase and reuse the app's shared framework pieces such as Prisma, validation, includes, and logging.

Run all commands from the repo root with `pnpm --dir app run ...`.

## What These Tools Are For

There are three main jobs here:

1. Bootstrap new `System` and `Team` records from existing registry products.
2. Find likely duplicate or related `System` and `Team` clusters for review.
3. Consolidate reviewed clusters into brand new `System` or `Team` records while archiving the source records.
4. Backfill derived fields such as `originKind` onto existing records after the model evolves.

## Typical Workflow

The normal operating flow is:

1. Bootstrap `System` records from existing public/private cloud products.
2. Bootstrap `Team` records from existing public/private cloud products.
3. Backfill `originKind` on existing `System` / `Team` records if you need sorting/filtering to reflect provenance in the UI.
4. Generate `System` merge candidates.
5. Review the generated `System` JSON / Markdown and, if useful, edit suggested names.
6. Run `System` consolidation in `--dry-run` mode.
7. Run `System` consolidation for real.
8. Generate `Team` merge candidates.
9. Review the generated `Team` CSV / JSON / Markdown and edit suggested names in the CSV if needed.
10. Resync the `Team` JSON / Markdown from the reviewed CSV if needed.
11. Run `Team` consolidation in `--dry-run` mode.
12. Run `Team` consolidation for real.

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

This writes JSON and Markdown review artifacts.

Default run:

```sh
pnpm --dir app run admin-tool:find-system-merge-candidates
```

Optional flags:

```sh
pnpm --dir app run admin-tool:find-system-merge-candidates -- --min-score 0.68 --limit 25
pnpm --dir app run admin-tool:find-system-merge-candidates -- --json-out app/app/admin-tools/output/system-candidates.json --md-out app/app/admin-tools/output/system-candidates.md
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
