export const up = async (db, client) => {
  const users = db.collection('User');

  const privateProducts = db.collection('PrivateCloudProduct');
  const publicProducts = db.collection('PublicCloudProduct');

  const privateRequests = db.collection('PrivateCloudRequest');
  const publicRequests = db.collection('PublicCloudRequest');

  const privateRequestData = db.collection('PrivateCloudRequestData');
  const publicRequestData = db.collection('PublicCloudRequestData');

  const publicBilling = db.collection('PublicCloudBilling');

  const privateComments = db.collection('PrivateCloudComment');
  const reactions = db.collection('Reaction');

  const events = db.collection('Event');
  const tasks = db.collection('Task');

  const sortByRecencyDesc = (a, b) => {
    const ad = a.updatedAt ?? a.createdAt ?? 0;
    const bd = b.updatedAt ?? b.createdAt ?? 0;
    return (bd?.getTime?.() ?? 0) - (ad?.getTime?.() ?? 0);
  };

  // 1) find duplicated idirGuids
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

  // helpers
  const pipelineUpdateMany = async (col, filter, pipeline, { session } = {}) => {
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

  const replaceMemberUserId = async (col, arrayField, oldId, newId, { extraFilter = {}, session } = {}) => {
    return pipelineUpdateMany(
      col,
      { ...extraFilter, [`${arrayField}.userId`]: oldId },
      [
        {
          $set: {
            [arrayField]: {
              $map: {
                input: `$${arrayField}`,
                as: 'm',
                in: {
                  $cond: [{ $eq: ['$$m.userId', oldId] }, { $mergeObjects: ['$$m', { userId: newId }] }, '$$m'],
                },
              },
            },
          },
        },
      ],
      { session },
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
                input: `$${arrayField}`,
                as: 'x',
                in: { $cond: [{ $eq: ['$$x', oldId] }, newId, '$$x'] },
              },
            },
          },
        },
      ],
      { session },
    );
  };

  const rewireUserReferences = async (collections, oldId, newId, session) => {
    const {
      privateProducts,
      publicProducts,
      privateRequests,
      publicRequests,
      privateRequestData,
      publicRequestData,
      publicBilling,
      privateComments,
      reactions,
      events,
      tasks,
    } = collections;

    let rewired = 0;
    const INACTIVE = { extraFilter: { status: 'INACTIVE' }, session };

    // A) INACTIVE products
    for (const field of ['projectOwnerId', 'primaryTechnicalLeadId', 'secondaryTechnicalLeadId']) {
      rewired += await replaceScalarField(privateProducts, field, oldId, newId, INACTIVE);
      rewired += await replaceScalarField(publicProducts, field, oldId, newId, INACTIVE);
    }
    rewired += await replaceScalarField(publicProducts, 'expenseAuthorityId', oldId, newId, INACTIVE);
    rewired += await replaceMemberUserId(privateProducts, 'members', oldId, newId, INACTIVE);
    rewired += await replaceMemberUserId(publicProducts, 'members', oldId, newId, INACTIVE);

    // B) Requests
    for (const field of ['createdById', 'decisionMakerId', 'cancelledById']) {
      rewired += await replaceScalarField(privateRequests, field, oldId, newId, { session });
      rewired += await replaceScalarField(publicRequests, field, oldId, newId, { session });
    }

    // C) RequestData
    for (const field of ['projectOwnerId', 'primaryTechnicalLeadId', 'secondaryTechnicalLeadId']) {
      rewired += await replaceScalarField(privateRequestData, field, oldId, newId, { session });
    }
    rewired += await replaceMemberUserId(privateRequestData, 'members', oldId, newId, { session });

    for (const field of [
      'projectOwnerId',
      'primaryTechnicalLeadId',
      'secondaryTechnicalLeadId',
      'expenseAuthorityId',
    ]) {
      rewired += await replaceScalarField(publicRequestData, field, oldId, newId, { session });
    }
    rewired += await replaceMemberUserId(publicRequestData, 'members', oldId, newId, { session });

    // D) Billing
    for (const field of ['expenseAuthorityId', 'signedById', 'approvedById']) {
      rewired += await replaceScalarField(publicBilling, field, oldId, newId, { session });
    }

    // E) Comments + Reactions
    rewired += await replaceScalarField(privateComments, 'userId', oldId, newId, { session });
    rewired += await replaceScalarField(reactions, 'userId', oldId, newId, { session });

    // F) Events + Tasks
    rewired += await replaceScalarField(events, 'userId', oldId, newId, { session });
    for (const field of ['startedBy', 'completedBy']) {
      rewired += await replaceScalarField(tasks, field, oldId, newId, { session });
    }
    rewired += await replaceInArray(tasks, 'userIds', oldId, newId, { session });

    return rewired;
  };

  const collections = {
    privateProducts,
    publicProducts,
    privateRequests,
    publicRequests,
    privateRequestData,
    publicRequestData,
    publicBilling,
    privateComments,
    reactions,
    events,
    tasks,
  };

  const allDupUsers = await users
    .find({ idirGuid: { $in: duplicatedGuids } })
    .project({ _id: 1, idirGuid: 1, archived: 1, updatedAt: 1, createdAt: 1 })
    .toArray();

  const byGuid = new Map();
  for (const u of allDupUsers) {
    const key = u.idirGuid;
    if (!byGuid.has(key)) byGuid.set(key, []);
    byGuid.get(key).push(u);
  }

  let groupsProcessed = 0;
  let rewiredTotal = 0;
  let deletedUsers = 0;
  let keptDueToActiveProduct = 0;
  let skippedNoActiveUser = 0;

  for (const [idirGuid, group] of byGuid.entries()) {
    groupsProcessed++;

    const archivedUsers = group.filter((u) => u.archived === true);
    const nonArchivedUsers = group.filter((u) => u.archived !== true);

    let canonical;
    let sourcesToMerge;

    if (nonArchivedUsers.length > 0) {
      nonArchivedUsers.sort(sortByRecencyDesc);
      canonical = nonArchivedUsers[0];
      sourcesToMerge = archivedUsers;
    } else {
      if (archivedUsers.length < 2) {
        console.log(`[${idirGuid}] Only one archived user found; nothing to merge.`);
        continue;
      }

      archivedUsers.sort(sortByRecencyDesc);
      canonical = archivedUsers[0];
      sourcesToMerge = archivedUsers.slice(1);
      skippedNoActiveUser += sourcesToMerge.length;

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
        const { rewired, didDelete, keptActive } = await session.withTransaction(async () => {
          const rewired = await rewireUserReferences(collections, oldId, newId, session);

          const activePrivateLink = await privateProducts.findOne(
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

          const activePublicLink = await publicProducts.findOne(
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

          if (activePrivateLink || activePublicLink) {
            return { rewired, didDelete: false, keptActive: true };
          }

          const del = await users.deleteOne({ _id: oldId, archived: true }, { session });
          return { rewired, didDelete: (del?.deletedCount ?? 0) > 0, keptActive: false };
        });

        // counters + logs
        rewiredTotal += rewired;

        if (keptActive) {
          keptDueToActiveProduct++;
          console.log(
            `[${idirGuid}] Kept archived user ${String(
              oldId,
            )} (still linked to ACTIVE product). Rewired ops: ${rewired}`,
          );
        } else if (didDelete) {
          deletedUsers++;
          console.log(`[${idirGuid}] Deleted archived user ${String(oldId)}. Rewired ops: ${rewired}`);
        } else {
          console.log(
            `[${idirGuid}] Tried to delete archived user ${String(oldId)} but nothing deleted. Rewired ops: ${rewired}`,
          );
        }
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
  console.log(`Total rewired modifications (sum of modifiedCount across updates): ${rewiredTotal}`);
  console.log(`Deleted archived users: ${deletedUsers}`);
  console.log(`Kept archived users due to ACTIVE product links: ${keptDueToActiveProduct}`);
  console.log(`Skipped archived users (no non-archived user in group): ${skippedNoActiveUser}`);
};

export const down = async () => {};
