export const up = async (db, client) => {
  const collection = db.collection('PublicCloudRequestData');
  const batchSize = 100;
  let skip = 0;
  let totalReplaced = 0;

  const findUserById = async (id) => {
    if (!id) return false;
    return await db.collection('User').findOne({ _id: id }, { projection: { _id: 1 } });
  };

  const handleRequest = async (request) => {
    const { _id, expenseAuthorityId, projectOwnerId } = request;

    if (!expenseAuthorityId) {
      console.log(`Request ${_id} has no expenseAuthorityId`);
      return 0;
    }

    const eaUser = await findUserById(expenseAuthorityId);
    if (eaUser) return 0;

    console.log(`User ${expenseAuthorityId} not found for request ${_id}`);

    const poUser = await findUserById(projectOwnerId);
    if (!poUser) {
      console.log(`Project owner ${projectOwnerId} also not found for request ${_id}`);
      return 0;
    }

    await collection.updateOne({ _id }, { $set: { expenseAuthorityId: projectOwnerId } });
    console.log(`Replaced expenseAuthorityId with projectOwnerId for request ${_id}`);
    return 1;
  };

  while (true) {
    const requests = await collection
      .find({}, { projection: { _id: 1, expenseAuthorityId: 1, projectOwnerId: 1 } })
      .skip(skip)
      .limit(batchSize)
      .toArray();

    if (requests.length === 0) break;

    for (const request of requests) {
      totalReplaced += await handleRequest(request);
    }

    skip += requests.length;
  }

  console.log(`Updated ${totalReplaced} publicCloudRequestData - expenseAuthorityId replaced with projectOwnerId.`);
};
