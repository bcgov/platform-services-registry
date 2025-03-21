export const up = async (db, client) => {
  const publicRequests = await db
    .collection('PublicCloudRequest')
    .find(
      { type: { $ne: 'CREATE' } },
      {
        projection: { licencePlate: 1 },
        sort: { createdAt: 1 },
      },
    )
    .toArray();

  for (let x = 0; x < publicRequests.length; x++) {
    const request = publicRequests[x];

    const query = { licencePlate: { $eq: request.licencePlate } };

    const project = await db.collection('PublicCloudProduct').findOne(query);
    if (!project) {
      await db.collection('PublicCloudRequest').deleteMany(query);
      await db.collection('PublicCloudRequestData').deleteMany(query);
    }
  }
};

export const down = async (db, client) => {};
