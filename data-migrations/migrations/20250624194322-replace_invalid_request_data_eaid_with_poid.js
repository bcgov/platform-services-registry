export const up = async (db, client) => {
  const collection = db.collection('PublicCloudRequestData');
  const batchSize = 100;
  let skip = 0;
  let totalReplaced = 0;

  while (true) {
    const batch = await collection
      .find({}, { projection: { _id: 1, expenseAuthorityId: 1, projectOwnerId: 1 } })
      .skip(skip)
      .limit(batchSize)
      .toArray();

    if (batch.length === 0) break;

    for (const requestData of batch) {
      const { _id, expenseAuthorityId, projectOwnerId } = requestData;

      if (!expenseAuthorityId) {
        console.warn(`Request ${_id} has no expenseAuthorityId`);
        continue;
      }

      const userExists = await db.collection('User').findOne({ _id: expenseAuthorityId });

      if (!userExists) {
        console.warn(`User ${expenseAuthorityId} not found for request ${_id}`);

        if (projectOwnerId) {
          const projectOwnerExists = await db.collection('User').findOne({ _id: projectOwnerId });

          if (projectOwnerExists) {
            await collection.updateOne({ _id }, { $set: { expenseAuthorityId: projectOwnerId } });
            console.log(`Replaced expenseAuthorityId with projectOwnerId for request ${_id}`);
            totalReplaced++;
          } else {
            console.warn(`Project owner ${projectOwnerId} also not found for request ${_id}`);
          }
        }
      }
    }
    skip += batch.length;
  }

  console.log(`Updated  ${totalReplaced} publicCloudRequestData - expenseAuthorityId replaced with projectOwnerId:`);
};
