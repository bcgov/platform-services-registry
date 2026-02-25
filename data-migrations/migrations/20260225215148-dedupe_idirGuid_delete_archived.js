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

  // Helper: run an updateMany with a pipeline
  const pipelineUpdateMany = async (col, filter, pipeline) => {
    const res = await col.updateMany(filter, pipeline);
    return res?.modifiedCount ?? 0;
  };

  // Helper: replace a scalar ObjectId field from oldId -> newId
  const replaceScalarField = async (col, field, oldId, newId, extraFilter = {}) => {
    const res = await col.updateMany({ ...extraFilter, [field]: oldId }, { $set: { [field]: newId } });
    return res?.modifiedCount ?? 0;
  };

  // Helper: replace a member.userId inside array of { userId, roles }
  const replaceMemberUserId = async (col, arrayField, oldId, newId, extraFilter = {}) => {
    // pipeline: map over members and swap userId
    return pipelineUpdateMany(col, { ...extraFilter, [`${arrayField}.userId`]: oldId }, [
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
    ]);
  };

  // Helper: replace occurrences inside tasks.userIds (string/ObjectId array) — assumed ObjectId array in Mongo
  const replaceInArray = async (col, arrayField, oldId, newId, extraFilter = {}) => {
    return pipelineUpdateMany(col, { ...extraFilter, [arrayField]: oldId }, [
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
    ]);
  };

  // Load all duplicated groups in one go
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

    // We can only "merge" archived -> non-archived if there is at least one non-archived user
    if (nonArchivedUsers.length === 0) {
      skippedNoActiveUser += archivedUsers.length;
      console.log(`[${idirGuid}] No non-archived user exists; skipping ${archivedUsers.length} archived user(s).`);
      continue;
    }

    // Pick the canonical non-archived user (most recently updated, fallback createdAt)
    nonArchivedUsers.sort((a, b) => {
      const ad = a.updatedAt ?? a.createdAt ?? 0;
      const bd = b.updatedAt ?? b.createdAt ?? 0;
      return (bd?.getTime?.() ?? 0) - (ad?.getTime?.() ?? 0);
    });
    const canonical = nonArchivedUsers[0];

    for (const archivedUser of archivedUsers) {
      const oldId = archivedUser._id; // ObjectId
      const newId = canonical._id; // ObjectId

      if (String(oldId) === String(newId)) continue;

      let rewired = 0;

      // A) INACTIVE products: replace archived profile with non-archived for ANY role + members
      rewired += await replaceScalarField(privateProducts, 'projectOwnerId', oldId, newId, {
        status: 'INACTIVE',
      });
      rewired += await replaceScalarField(privateProducts, 'primaryTechnicalLeadId', oldId, newId, {
        status: 'INACTIVE',
      });
      rewired += await replaceScalarField(privateProducts, 'secondaryTechnicalLeadId', oldId, newId, {
        status: 'INACTIVE',
      });
      rewired += await replaceMemberUserId(privateProducts, 'members', oldId, newId, { status: 'INACTIVE' });

      rewired += await replaceScalarField(publicProducts, 'projectOwnerId', oldId, newId, {
        status: 'INACTIVE',
      });
      rewired += await replaceScalarField(publicProducts, 'primaryTechnicalLeadId', oldId, newId, {
        status: 'INACTIVE',
      });
      rewired += await replaceScalarField(publicProducts, 'secondaryTechnicalLeadId', oldId, newId, {
        status: 'INACTIVE',
      });
      rewired += await replaceScalarField(publicProducts, 'expenseAuthorityId', oldId, newId, {
        status: 'INACTIVE',
      });
      rewired += await replaceMemberUserId(publicProducts, 'members', oldId, newId, { status: 'INACTIVE' });

      // B) Requests (PRIVATE + PUBLIC): replace in any role (active or not)
      for (const field of ['createdById', 'decisionMakerId', 'cancelledById']) {
        rewired += await replaceScalarField(privateRequests, field, oldId, newId);
        rewired += await replaceScalarField(publicRequests, field, oldId, newId);
      }

      // C) RequestData (PRIVATE + PUBLIC): replace in any role + members (active or not)
      rewired += await replaceScalarField(privateRequestData, 'projectOwnerId', oldId, newId);
      rewired += await replaceScalarField(privateRequestData, 'primaryTechnicalLeadId', oldId, newId);
      rewired += await replaceScalarField(privateRequestData, 'secondaryTechnicalLeadId', oldId, newId);
      rewired += await replaceMemberUserId(privateRequestData, 'members', oldId, newId);

      rewired += await replaceScalarField(publicRequestData, 'projectOwnerId', oldId, newId);
      rewired += await replaceScalarField(publicRequestData, 'primaryTechnicalLeadId', oldId, newId);
      rewired += await replaceScalarField(publicRequestData, 'secondaryTechnicalLeadId', oldId, newId);
      rewired += await replaceScalarField(publicRequestData, 'expenseAuthorityId', oldId, newId);
      rewired += await replaceMemberUserId(publicRequestData, 'members', oldId, newId);

      // D) Billing: replace user refs (expenseAuthority/signedBy/approvedBy)
      rewired += await replaceScalarField(publicBilling, 'expenseAuthorityId', oldId, newId);
      rewired += await replaceScalarField(publicBilling, 'signedById', oldId, newId);
      rewired += await replaceScalarField(publicBilling, 'approvedById', oldId, newId);

      // E) Comments + Reactions
      rewired += await replaceScalarField(privateComments, 'userId', oldId, newId);
      rewired += await replaceScalarField(reactions, 'userId', oldId, newId);

      // F) Events + Tasks
      rewired += await replaceScalarField(events, 'userId', oldId, newId);
      rewired += await replaceScalarField(tasks, 'startedBy', oldId, newId);
      rewired += await replaceScalarField(tasks, 'completedBy', oldId, newId);
      rewired += await replaceInArray(tasks, 'userIds', oldId, newId);

      rewiredTotal += rewired;

      // 2) Only delete archived user if it does NOT connect to any ACTIVE product (any role + members)
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
        { projection: { _id: 1 } },
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
        { projection: { _id: 1 } },
      );

      if (activePrivateLink || activePublicLink) {
        keptDueToActiveProduct++;
        console.log(
          `[${idirGuid}] Kept archived user ${String(oldId)} (still linked to ACTIVE product). Rewired ops: ${rewired}`,
        );
        continue;
      }

      // 3) Safe delete archived user
      const del = await users.deleteOne({ _id: oldId, archived: true });
      if ((del?.deletedCount ?? 0) > 0) {
        deletedUsers++;
        console.log(`[${idirGuid}] Deleted archived user ${String(oldId)}. Rewired ops: ${rewired}`);
      } else {
        console.log(
          `[${idirGuid}] Tried to delete archived user ${String(oldId)} but nothing deleted (maybe already removed).`,
        );
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
