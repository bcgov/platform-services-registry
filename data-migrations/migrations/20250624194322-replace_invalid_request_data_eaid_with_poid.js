export const up = async (db, client) => {
  const collection = db.collection('PublicCloudRequestData');
  const batchSize = 100;
  let skip = 0;
  let totalReplaced = 0;

  const userExists = async (id) => {
    if (!id) return false;
    return await db.collection('User').findOne({ _id: id });
  };

  const handleRequest = async (requestData) => {
    const { _id, expenseAuthorityId, projectOwnerId } = requestData;

    if (!expenseAuthorityId) {
      console.warn(`Request ${_id} has no expenseAuthorityId`);
      return 0;
    }

    const expenseUser = await userExists(expenseAuthorityId);
    if (expenseUser) return 0;

    console.warn(`User ${expenseAuthorityId} not found for request ${_id}`);

    const projectUser = await userExists(projectOwnerId);
    if (!projectUser) {
      console.warn(`Project owner ${projectOwnerId} also not found for request ${_id}`);
      return 0;
    }

    await collection.updateOne({ _id }, { $set: { expenseAuthorityId: projectOwnerId } });
    console.log(`Replaced expenseAuthorityId with projectOwnerId for request ${_id}`);
    return 1;
  };

  while (true) {
    const batch = await collection
      .find({}, { projection: { _id: 1, expenseAuthorityId: 1, projectOwnerId: 1 } })
      .skip(skip)
      .limit(batchSize)
      .toArray();

    if (batch.length === 0) break;

    for (const requestData of batch) {
      totalReplaced += await handleRequest(requestData);
    }

    skip += batch.length;
  }

  console.log(`Updated ${totalReplaced} publicCloudRequestData - expenseAuthorityId replaced with projectOwnerId.`);
};
