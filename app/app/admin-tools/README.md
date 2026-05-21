# Admin Tools

These tools are command-line entrypoints that live in the app codebase and reuse the app's shared framework pieces such as Prisma, validation, includes, and logging.

## Create system from public cloud product

Creates `System` records from existing public cloud products, copies top-level product metadata into the new system, adds provenance metadata for traceability, and links the new system back to the source product.

Run from the repo root:

```sh
pnpm --dir app run admin-tool:create-system-from-public-cloud-product -- --licence-plate <LICENCE_PLATE>
```

Example:

```sh
pnpm --dir app run admin-tool:create-system-from-public-cloud-product -- --licence-plate abc123
```

To process all public cloud products, omit the licence plate:

```sh
pnpm --dir app run admin-tool:create-system-from-public-cloud-product
```

## Create system from private cloud product

Creates `System` records from existing private cloud products using the same bootstrap/provenance approach.

Single product:

```sh
pnpm --dir app run admin-tool:create-system-from-private-cloud-product -- --licence-plate abc123
```

All private cloud products:

```sh
pnpm --dir app run admin-tool:create-system-from-private-cloud-product
```

## Create team from public cloud product

Creates `Team` records from existing public cloud products, derives a team name like `<Product Name> Team`, copies product membership into the new team's `members` list, links the team back to the product, and links it to the corresponding bootstrapped `System`.

Single product:

```sh
pnpm --dir app run admin-tool:create-team-from-public-cloud-product -- --licence-plate abc123
```

All public cloud products:

```sh
pnpm --dir app run admin-tool:create-team-from-public-cloud-product
```

## Create team from private cloud product

Creates `Team` records from existing private cloud products using the same bootstrap/provenance approach.

Single product:

```sh
pnpm --dir app run admin-tool:create-team-from-private-cloud-product -- --licence-plate abc123
```

All private cloud products:

```sh
pnpm --dir app run admin-tool:create-team-from-private-cloud-product
```

## Find system merge candidates

Scans existing `System` records, scores pairwise similarity using system names plus supporting signals such as shared organization, linked teams, overlapping team members, and linked resource names, then emits proposed merge clusters.

By default it writes both JSON and Markdown review artifacts under `app/admin-tools/output/`.

Default run:

```sh
pnpm --dir app run admin-tool:find-system-merge-candidates
```

Optional flags:

```sh
pnpm --dir app run admin-tool:find-system-merge-candidates -- --min-score 0.68 --limit 25
pnpm --dir app run admin-tool:find-system-merge-candidates -- --json-out app/admin-tools/output/candidates.json --md-out app/admin-tools/output/candidates.md
```

## Find team merge candidates

Scans existing `Team` records and groups candidate duplicate teams by exact matching of the full `PROJECT_OWNER` and `PRIMARY_TECHNICAL_LEAD` member sets. Teams missing either core role are excluded. The output includes a suggested new team name, the union of linked systems, and a suggested consolidated member set.

Default run:

```sh
pnpm --dir app run admin-tool:find-team-merge-candidates
```

Optional flags:

```sh
pnpm --dir app run admin-tool:find-team-merge-candidates -- --limit 25
pnpm --dir app run admin-tool:find-team-merge-candidates -- --json-out app/admin-tools/output/team-candidates.json --md-out app/admin-tools/output/team-candidates.md
pnpm --dir app run admin-tool:find-team-merge-candidates -- --csv-out app/admin-tools/output/team-candidates.csv
```

## Merge systems from candidate clusters

Reads a merge-candidate JSON file, selects clusters by explicit id, id range, score threshold, or any union of those selectors, then consolidates each selected cluster into a brand new `System`. The source Systems are archived after their Team and Product links are moved to the new consolidated System.

Dry run:

```sh
pnpm --dir app run admin-tool:merge-systems-from-candidates -- --input app/admin-tools/output/system-merge-candidates.json --cluster-id cluster-001 --dry-run
```

Examples:

```sh
pnpm --dir app run admin-tool:merge-systems-from-candidates -- --input app/admin-tools/output/system-merge-candidates.json --cluster-id cluster-023
pnpm --dir app run admin-tool:merge-systems-from-candidates -- --input app/admin-tools/output/system-merge-candidates.json --cluster-range cluster-001:cluster-012
pnpm --dir app run admin-tool:merge-systems-from-candidates -- --input app/admin-tools/output/system-merge-candidates.json --min-score 0.82
```

## Merge teams from candidate clusters

Reads a Team merge-candidate JSON file, selects clusters by explicit id, id range, non-core member score threshold, or any union of those selectors, then consolidates each selected cluster into a brand new `Team`. The source Teams are archived after their System and Product links are moved to the new consolidated Team.

Dry run:

```sh
pnpm --dir app run admin-tool:merge-teams-from-candidates -- --input app/admin-tools/output/team-merge-candidates.json --cluster-id cluster-001 --dry-run
```

Examples:

```sh
pnpm --dir app run admin-tool:merge-teams-from-candidates -- --input app/admin-tools/output/team-merge-candidates.json --cluster-id cluster-023
pnpm --dir app run admin-tool:merge-teams-from-candidates -- --input app/admin-tools/output/team-merge-candidates.json --cluster-range cluster-001:cluster-012
pnpm --dir app run admin-tool:merge-teams-from-candidates -- --input app/admin-tools/output/team-merge-candidates.json --min-score 0.82
```
