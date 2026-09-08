/**
 * Silver dev only. Prisma cannot load PublicCloudProduct when organizationId or a
 * required contact id is null / points at a missing document. That 500s
 * GET /api/v1/public-cloud/products and blocks the finance ingest DAG.
 */
function isDevOnly() {
  return process.env.APP_ENV === 'dev';
}

function idString(value) {
  if (value == null) return '';
  return String(value);
}

function knownId(value, known) {
  const key = idString(value);
  return key.length > 0 && known.has(key);
}

function pickOrganization(product, orgById, orgByCode, fallbackOrg) {
  if (knownId(product.organizationId, orgById)) return product.organizationId;
  const code = typeof product.ministry === 'string' ? product.ministry.trim().toUpperCase() : '';
  if (code && orgByCode.has(code)) return orgByCode.get(code)._id;
  return fallbackOrg._id;
}

function pickUser(preferred, userIds, fallbacks) {
  if (knownId(preferred, userIds)) return preferred;
  for (const id of fallbacks) {
    if (knownId(id, userIds)) return id;
  }
  return fallbacks[fallbacks.length - 1];
}

function refsChanged(product, next) {
  return (
    idString(product.organizationId) !== idString(next.organizationId) ||
    idString(product.projectOwnerId) !== idString(next.projectOwnerId) ||
    idString(product.primaryTechnicalLeadId) !== idString(next.primaryTechnicalLeadId) ||
    idString(product.expenseAuthorityId) !== idString(next.expenseAuthorityId) ||
    idString(product.secondaryTechnicalLeadId) !== idString(next.secondaryTechnicalLeadId)
  );
}

export const up = async (db, client) => {
  if (!isDevOnly()) {
    console.log(`backfill_dev_public_cloud_required_refs: skip (APP_ENV=${process.env.APP_ENV || 'unset'})`);
    return;
  }

  const organizations = await db.collection('Organization').find({}).toArray();
  const users = await db
    .collection('User')
    .find({}, { projection: { _id: 1, email: 1 } })
    .toArray();

  if (organizations.length === 0) {
    console.log('backfill_dev_public_cloud_required_refs: no Organization documents; skip writes.');
    return;
  }
  if (users.length === 0) {
    console.log('backfill_dev_public_cloud_required_refs: no User documents; skip writes.');
    return;
  }

  const orgById = new Map(organizations.map((org) => [idString(org._id), org]));
  const orgByCode = new Map(
    organizations.filter((org) => typeof org.code === 'string').map((org) => [org.code.trim().toUpperCase(), org]),
  );
  const fallbackOrg = orgByCode.get('CITZ') || organizations[0];
  const userIds = new Set(users.map((user) => idString(user._id)));
  const fallbackUser =
    users.find((user) => String(user.email || '').toLowerCase() === 'admin.system@gov.bc.ca') || users[0];

  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      const PublicCloudProduct = db.collection('PublicCloudProduct');
      const products = await PublicCloudProduct.find(
        {},
        {
          projection: {
            licencePlate: 1,
            ministry: 1,
            organizationId: 1,
            projectOwnerId: 1,
            primaryTechnicalLeadId: 1,
            secondaryTechnicalLeadId: 1,
            expenseAuthorityId: 1,
          },
          session,
        },
      ).toArray();

      const writes = [];
      for (const product of products) {
        const projectOwnerId = pickUser(product.projectOwnerId, userIds, [fallbackUser._id]);
        const primaryTechnicalLeadId = pickUser(product.primaryTechnicalLeadId, userIds, [
          projectOwnerId,
          fallbackUser._id,
        ]);
        const expenseAuthorityId = pickUser(product.expenseAuthorityId, userIds, [
          projectOwnerId,
          primaryTechnicalLeadId,
          fallbackUser._id,
        ]);
        const organizationId = pickOrganization(product, orgById, orgByCode, fallbackOrg);
        const secondaryTechnicalLeadId = knownId(product.secondaryTechnicalLeadId, userIds)
          ? product.secondaryTechnicalLeadId
          : null;
        const next = {
          organizationId,
          projectOwnerId,
          primaryTechnicalLeadId,
          expenseAuthorityId,
          secondaryTechnicalLeadId,
        };
        if (!refsChanged(product, next)) continue;

        writes.push({
          updateOne: {
            filter: { _id: product._id },
            update: { $set: next },
          },
        });
      }

      if (writes.length === 0) {
        console.log('backfill_dev_public_cloud_required_refs: all public-cloud products already have valid refs.');
        return;
      }

      const result = await PublicCloudProduct.bulkWrite(writes, { ordered: false, session });
      console.log(
        `backfill_dev_public_cloud_required_refs: updated ${result.modifiedCount} of ${writes.length} public-cloud products.`,
      );
    });
  } catch (error) {
    console.error('backfill_dev_public_cloud_required_refs failed:', error);
    throw error;
  } finally {
    await session.endSession();
  }
};

export const down = async () => {
  console.log('backfill_dev_public_cloud_required_refs: down is a no-op (filled refs are not restored).');
};
