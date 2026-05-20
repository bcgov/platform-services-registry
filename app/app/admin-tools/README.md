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
