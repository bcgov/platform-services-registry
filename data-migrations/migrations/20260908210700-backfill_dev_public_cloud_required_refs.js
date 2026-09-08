/**
 * Silver dev only. Prisma cannot load PublicCloudProduct when organizationId or a
 * required contact id is null / points at a missing document. That 500s
 * GET /api/v1/public-cloud/products and blocks the finance ingest DAG.
 *
 * Writes are per-document and idempotent. No shared helper with the already-applied
 * account-id backfill (changing that file would rewrite a ran migration).
 */
function asId(value) {
  return value == null ? '' : String(value);
}

function isKnown(value, known) {
  const key = asId(value);
  return Boolean(key) && known.has(key);
}

function canonicalId(value, known) {
  return known.get(asId(value));
}

function organizationFor(product, byId, byCode, fallback) {
  if (isKnown(product.organizationId, byId)) return canonicalId(product.organizationId, byId);
  const ministry = typeof product.ministry === 'string' ? product.ministry.trim().toUpperCase() : '';
  return (ministry && byCode.get(ministry)?._id) || fallback._id;
}

function userFor(current, knownUsers, candidates) {
  if (isKnown(current, knownUsers)) return canonicalId(current, knownUsers);
  const match = candidates.find((id) => isKnown(id, knownUsers));
  return match ? canonicalId(match, knownUsers) : candidates.at(-1);
}

function needsWrite(product, patch) {
  return Object.entries(patch).some(([field, value]) => {
    const current = product[field];
    if (asId(current) !== asId(value)) return true;
    if (value == null) return false;
    // Rewrite a hex string to the collection's BSON ObjectId so Prisma can load the ref.
    return value._bsontype === 'ObjectId' && current?._bsontype !== 'ObjectId';
  });
}

function lookupTables(organizations, users) {
  const byId = new Map(organizations.map((org) => [asId(org._id), org._id]));
  const byCode = new Map(
    organizations.filter((org) => typeof org.code === 'string').map((org) => [org.code.trim().toUpperCase(), org]),
  );
  const knownUsers = new Map(users.map((user) => [asId(user._id), user._id]));
  const fallbackUser =
    users.find((user) => String(user.email || '').toLowerCase() === 'admin.system@gov.bc.ca') ?? users[0];
  return { byId, byCode, fallbackOrg: byCode.get('CITZ') ?? organizations[0], knownUsers, fallbackUser };
}

function patchFor(product, tables) {
  const projectOwnerId = userFor(product.projectOwnerId, tables.knownUsers, [tables.fallbackUser._id]);
  const primaryTechnicalLeadId = userFor(product.primaryTechnicalLeadId, tables.knownUsers, [
    projectOwnerId,
    tables.fallbackUser._id,
  ]);
  return {
    organizationId: organizationFor(product, tables.byId, tables.byCode, tables.fallbackOrg),
    projectOwnerId,
    primaryTechnicalLeadId,
    expenseAuthorityId: userFor(product.expenseAuthorityId, tables.knownUsers, [
      projectOwnerId,
      primaryTechnicalLeadId,
      tables.fallbackUser._id,
    ]),
    secondaryTechnicalLeadId: isKnown(product.secondaryTechnicalLeadId, tables.knownUsers)
      ? canonicalId(product.secondaryTechnicalLeadId, tables.knownUsers)
      : null,
  };
}

export const up = async (db) => {
  const appEnv = process.env.APP_ENV;
  if (appEnv !== 'dev') {
    console.log(
      `backfill_dev_public_cloud_required_refs: not running outside Silver dev (APP_ENV=${appEnv || 'unset'})`,
    );
    return;
  }

  const [organizations, users] = await Promise.all([
    db.collection('Organization').find({}).toArray(),
    db
      .collection('User')
      .find({}, { projection: { _id: 1, email: 1 } })
      .toArray(),
  ]);
  if (!organizations.length || !users.length) {
    console.log(
      `backfill_dev_public_cloud_required_refs: missing ${
        organizations.length ? 'users' : 'organizations'
      }; no writes.`,
    );
    return;
  }

  const tables = lookupTables(organizations, users);
  const products = db.collection('PublicCloudProduct');
  const docs = await products
    .find(
      {},
      {
        projection: {
          ministry: 1,
          organizationId: 1,
          projectOwnerId: 1,
          primaryTechnicalLeadId: 1,
          secondaryTechnicalLeadId: 1,
          expenseAuthorityId: 1,
        },
      },
    )
    .toArray();

  let modified = 0;
  for (const product of docs) {
    const patch = patchFor(product, tables);
    if (!needsWrite(product, patch)) continue;
    const result = await products.updateOne({ _id: product._id }, { $set: patch });
    modified += result.modifiedCount;
  }

  console.log(`backfill_dev_public_cloud_required_refs: wrote ${modified} PublicCloudProduct document(s).`);
};

export const down = async () => {};
