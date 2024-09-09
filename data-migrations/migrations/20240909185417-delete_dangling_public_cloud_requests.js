export const up = async (db, client) => {
  const publicRequests = await db
    .collection('PublicCloudRequest')
    .find(
      {},
      {
        projection: { licencePlate: 1 },
        sort: { createdAt: 1 },
      },
    )
    .toArray();

  for (let x = 0; x < publicRequests.length; x++) {
    const request = publicRequests[x];

    const query = { licencePlate: { $eq: request.licencePlate } };

    const project = await db.collection('PublicCloudProject').findOne(query);
    if (!project) {
      await db.collection('PublicCloudRequest').deleteMany(query);
      await db.collection('PublicCloudRequestedProject').deleteMany(query);
    }
  }
};

export const down = async (db, client) => {};
