export const up = async (db, client) => {
  const users = db.collection('User');

  const collections = {
    privateProducts: db.collection('PrivateCloudProduct'),
    publicProducts: db.collection('PublicCloudProduct'),
    privateRequests: db.collection('PrivateCloudRequest'),
    publicRequests: db.collection('PublicCloudRequest'),
    privateRequestData: db.collection('PrivateCloudRequestData'),
    publicRequestData: db.collection('PublicCloudRequestData'),
    publicBilling: db.collection('PublicCloudBilling'),
    privateComments: db.collection('PrivateCloudComment'),
    reactions: db.collection('Reaction'),
    events: db.collection('Event'),
    tasks: db.collection('Task'),
  };

  const sortByRecencyDesc = (a, b) => {
    const ad = a.updatedAt ?? a.createdAt ?? 0;
    const bd = b.updatedAt ?? b.createdAt ?? 0;
    return (bd?.getTime?.() ?? 0) - (ad?.getTime?.() ?? 0);
  };

  // Helpers
  const pipelineUpdateMany = async (col, filter, pipeline, session) => {
    const res = await col.updateMany(filter, pipeline, session ? { session } : undefined);
    return res?.modifiedCount ?? 0;
  };

  const replaceScalarField = async (col, field, oldId, newId, { extraFilter = {}, session } = {}) => {
    const res = await col.updateMany(
      { ...extraFilter, [field]: oldId },
      { $set: { [field]: newId } },
      session ? { session } : undefined,
    );
    return res?.modifiedCount ?? 0;
  };

  const replaceFields = async (col, fields, oldId, newId, opts) => {
    let modifiedDocs = 0;
    for (const field of fields) {
      modifiedDocs += await replaceScalarField(col, field, oldId, newId, opts);
    }
    return modifiedDocs;
  };

  const replaceMemberUserId = async (col, arrayField, oldId, newId, { extraFilter = {}, session } = {}) => {
    return pipelineUpdateMany(
      col,
      { ...extraFilter, [`${arrayField}.userId`]: oldId },
      [
        {
          $set: {
            [arrayField]: {
              $map: {
                input: { $ifNull: [`$${arrayField}`, []] },
                as: 'm',
                in: {
                  $cond: [{ $eq: ['$$m.userId', oldId] }, { $mergeObjects: ['$$m', { userId: newId }] }, '$$m'],
                },
              },
            },
          },
        },
      ],
      session,
    );
  };

  const replaceInArray = async (col, arrayField, oldId, newId, { extraFilter = {}, session } = {}) => {
    return pipelineUpdateMany(
      col,
      { ...extraFilter, [arrayField]: oldId },
      [
        {
          $set: {
            [arrayField]: {
              $map: {
                input: { $ifNull: [`$${arrayField}`, []] },
                as: 'x',
                in: { $cond: [{ $eq: ['$$x', oldId] }, newId, '$$x'] },
              },
            },
          },
        },
      ],
      session,
    );
  };

  const rewireInactiveProducts = async (c, oldId, newId, session) => {
    const INACTIVE = { extraFilter: { status: 'INACTIVE' }, session };

    let modifiedDocs = 0;
    const roleFields = ['projectOwnerId', 'primaryTechnicalLeadId', 'secondaryTechnicalLeadId'];

    modifiedDocs += await replaceFields(c.privateProducts, roleFields, oldId, newId, INACTIVE);
    modifiedDocs += await replaceFields(c.publicProducts, roleFields, oldId, newId, INACTIVE);

    modifiedDocs += await replaceScalarField(c.publicProducts, 'expenseAuthorityId', oldId, newId, INACTIVE);

    modifiedDocs += await replaceMemberUserId(c.privateProducts, 'members', oldId, newId, INACTIVE);
    modifiedDocs += await replaceMemberUserId(c.publicProducts, 'members', oldId, newId, INACTIVE);

    return modifiedDocs;
  };

  const rewireRequests = async (c, oldId, newId, session) => {
    let modifiedDocs = 0;
    const requestFields = ['createdById', 'decisionMakerId', 'cancelledById'];

    modifiedDocs += await replaceFields(c.privateRequests, requestFields, oldId, newId, { session });
    modifiedDocs += await replaceFields(c.publicRequests, requestFields, oldId, newId, { session });

    return modifiedDocs;
  };

  const rewirePrivateRequestData = async (c, oldId, newId, session) => {
    let modifiedDocs = 0;
    const fields = ['projectOwnerId', 'primaryTechnicalLeadId', 'secondaryTechnicalLeadId'];

    modifiedDocs += await replaceFields(c.privateRequestData, fields, oldId, newId, { session });
    modifiedDocs += await replaceMemberUserId(c.privateRequestData, 'members', oldId, newId, { session });

    return modifiedDocs;
  };

  const rewirePublicRequestData = async (c, oldId, newId, session) => {
    let modifiedDocs = 0;
    const fields = ['projectOwnerId', 'primaryTechnicalLeadId', 'secondaryTechnicalLeadId', 'expenseAuthorityId'];

    modifiedDocs += await replaceFields(c.publicRequestData, fields, oldId, newId, { session });
    modifiedDocs += await replaceMemberUserId(c.publicRequestData, 'members', oldId, newId, { session });

    return modifiedDocs;
  };

  const rewireBilling = async (c, oldId, newId, session) => {
    const fields = ['expenseAuthorityId', 'signedById', 'approvedById'];
    return replaceFields(c.publicBilling, fields, oldId, newId, { session });
  };

  const rewireCommentsAndReactions = async (c, oldId, newId, session) => {
    let modifiedDocs = 0;
    modifiedDocs += await replaceScalarField(c.privateComments, 'userId', oldId, newId, { session });
    modifiedDocs += await replaceScalarField(c.reactions, 'userId', oldId, newId, { session });
    return modifiedDocs;
  };

  const rewireEventsAndTasks = async (c, oldId, newId, session) => {
    let modifiedDocs = 0;

    modifiedDocs += await replaceScalarField(c.events, 'userId', oldId, newId, { session });

    const taskFields = ['startedBy', 'completedBy'];
    modifiedDocs += await replaceFields(c.tasks, taskFields, oldId, newId, { session });

    modifiedDocs += await replaceInArray(c.tasks, 'userIds', oldId, newId, { session });

    return modifiedDocs;
  };

  const rewireUserReferences = async (c, oldId, newId, session) => {
    let modifiedDocs = 0;

    modifiedDocs += await rewireInactiveProducts(c, oldId, newId, session);
    modifiedDocs += await rewireRequests(c, oldId, newId, session);
    modifiedDocs += await rewirePrivateRequestData(c, oldId, newId, session);
    modifiedDocs += await rewirePublicRequestData(c, oldId, newId, session);
    modifiedDocs += await rewireBilling(c, oldId, newId, session);
    modifiedDocs += await rewireCommentsAndReactions(c, oldId, newId, session);
    modifiedDocs += await rewireEventsAndTasks(c, oldId, newId, session);

    return modifiedDocs;
  };

  const hasActiveProductLink = async (c, oldId, session) => {
    const activePrivateLink = await c.privateProducts.findOne(
      {
        status: 'ACTIVE',
        $or: [
          { projectOwnerId: oldId },
          { primaryTechnicalLeadId: oldId },
          { secondaryTechnicalLeadId: oldId },
          { 'members.userId': oldId },
        ],
      },
      { projection: { _id: 1 }, session },
    );

    if (activePrivateLink) return true;

    const activePublicLink = await c.publicProducts.findOne(
      {
        status: 'ACTIVE',
        $or: [
          { projectOwnerId: oldId },
          { primaryTechnicalLeadId: oldId },
          { secondaryTechnicalLeadId: oldId },
          { expenseAuthorityId: oldId },
          { 'members.userId': oldId },
        ],
      },
      { projection: { _id: 1 }, session },
    );

    return !!activePublicLink;
  };
  const dup = await users
    .aggregate([
      { $match: { idirGuid: { $exists: true, $ne: '' } } },
      { $group: { _id: '$idirGuid', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $project: { _id: 1 } },
    ])
    .toArray();

  const duplicatedGuids = dup.map((x) => x._id);
  console.log(`Duplicated idirGuid count: ${duplicatedGuids.length}`);

  if (duplicatedGuids.length === 0) {
    console.log('No duplicated idirGuid found. Nothing to do.');
    return;
  }

  const allDupUsers = await users
    .find({ idirGuid: { $in: duplicatedGuids } })
    .project({ _id: 1, idirGuid: 1, archived: 1, updatedAt: 1, createdAt: 1 })
    .toArray();

  const byGuid = new Map();
  for (const u of allDupUsers) {
    if (!byGuid.has(u.idirGuid)) byGuid.set(u.idirGuid, []);
    byGuid.get(u.idirGuid).push(u);
  }

  let groupsProcessed = 0;
  let totalRewiredModifiedDocs = 0;
  let deletedUsers = 0;
  let keptDueToActiveProduct = 0;
  let mergedArchivedWhenNoActiveUser = 0;

  // each duplicated idirGuid group process
  for (const [idirGuid, group] of byGuid.entries()) {
    groupsProcessed++;

    const archivedUsers = group.filter((u) => u.archived === true);
    const nonArchivedUsers = group.filter((u) => u.archived !== true);

    const { canonical, sourcesToMerge, hadNonArchived } = (() => {
      if (nonArchivedUsers.length > 0) {
        nonArchivedUsers.sort(sortByRecencyDesc);
        return { canonical: nonArchivedUsers[0], sourcesToMerge: archivedUsers, hadNonArchived: true };
      }

      if (archivedUsers.length < 2) {
        return { canonical: null, sourcesToMerge: [], hadNonArchived: false };
      }

      archivedUsers.sort(sortByRecencyDesc);
      return { canonical: archivedUsers[0], sourcesToMerge: archivedUsers.slice(1), hadNonArchived: false };
    })();

    if (!canonical || sourcesToMerge.length === 0) {
      if (!canonical) console.log(`[${idirGuid}] Only one archived user found; nothing to merge.`);
      continue;
    }

    if (!hadNonArchived) {
      mergedArchivedWhenNoActiveUser += sourcesToMerge.length;
      console.log(
        `[${idirGuid}] No non-archived user exists; keeping most-recent archived ${String(canonical._id)}; merging ${
          sourcesToMerge.length
        } archived duplicate(s).`,
      );
    }

    for (const archivedUser of sourcesToMerge) {
      const oldId = archivedUser._id;
      const newId = canonical._id;
      if (String(oldId) === String(newId)) continue;

      const session = client.startSession();
      try {
        const result = await session.withTransaction(async () => {
          const rewiredModifiedDocs = await rewireUserReferences(collections, oldId, newId, session);

          const keepBecauseActive = await hasActiveProductLink(collections, oldId, session);
          if (keepBecauseActive) {
            return { rewiredModifiedDocs, didDelete: false, keptActive: true };
          }

          const del = await users.deleteOne({ _id: oldId, archived: true }, { session });
          return { rewiredModifiedDocs, didDelete: (del?.deletedCount ?? 0) > 0, keptActive: false };
        });

        totalRewiredModifiedDocs += result.rewiredModifiedDocs;

        if (result.keptActive) {
          keptDueToActiveProduct++;
          console.log(
            `[${idirGuid}] Kept archived user ${String(oldId)} (still linked to ACTIVE product). Modified docs: ${
              result.rewiredModifiedDocs
            }`,
          );
          continue;
        }

        if (result.didDelete) {
          deletedUsers++;
          console.log(
            `[${idirGuid}] Deleted archived user ${String(oldId)}. Modified docs: ${result.rewiredModifiedDocs}`,
          );
          continue;
        }

        console.log(
          `[${idirGuid}] Tried to delete archived user ${String(oldId)} but nothing deleted. Modified docs: ${
            result.rewiredModifiedDocs
          }`,
        );
      } catch (err) {
        console.error(
          `[${idirGuid}] Transaction failed for archived user ${String(oldId)} -> canonical ${String(newId)}`,
          err,
        );
        throw err;
      } finally {
        await session.endSession();
      }
    }
  }

  console.log('Migration finished.');
  console.log(`Duplicated idirGuid groups processed: ${groupsProcessed}`);
  console.log(`Total rewired modified documents (sum of modifiedCount across updates): ${totalRewiredModifiedDocs}`);
  console.log(`Deleted archived users: ${deletedUsers}`);
  console.log(`Kept archived users due to ACTIVE product links: ${keptDueToActiveProduct}`);
  console.log(`Merged archived users where no non-archived user existed: ${mergedArchivedWhenNoActiveUser}`);
};

export const down = async () => {};
