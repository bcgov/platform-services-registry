export const up = async (db, client) => {
  const users = db.collection('User');

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

  // 2) Find archived used in idirGuid duplications groups
  const archivedDupUsers = await users
    .find({
      archived: true,
      idirGuid: { $in: duplicatedGuids },
    })
    .project({ _id: 1, idirGuid: 1 })
    .toArray();

  console.log(`Archived users within duplicated groups: ${archivedDupUsers.length}`);

  let updated = 0;
  let skippedAlreadyPostfixed = 0;

  for (const u of archivedDupUsers) {
    const current = String(u.idirGuid || '');

    if (current.endsWith('-isArchived') || current.includes('-isArchived-')) {
      skippedAlreadyPostfixed++;
      continue;
    }

    const base = `${current}-isArchived`;
    let candidate = base;
    let i = 1;

    while (true) {
      const exists = await users.findOne({ idirGuid: candidate }, { projection: { _id: 1 } });
      if (!exists) break;

      i++;
      candidate = `${base}-${i}`;
    }

    await users.updateOne({ _id: u._id }, { $set: { idirGuid: candidate } });

    updated++;
  }

  console.log('Migration finished.');
  console.log(`Updated: ${updated}`);
  console.log(`Skipped (already postfixed): ${skippedAlreadyPostfixed}`);
};

export const down = async () => {};
