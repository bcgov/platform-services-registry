export const up = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    const createdAt = new Date();

    const privateCloudRequests = await db
      .collection('PrivateCloudRequest')
      .find({ active: true, decisionStatus: 'PENDING' })
      .toArray();

    for (let x = 0; x < privateCloudRequests.length; x++) {
      const req = privateCloudRequests[x];
      await db.collection('Task').insertOne({
        type: 'REVIEW_PRIVATE_CLOUD_REQUEST',
        status: 'ASSIGNED',
        permissions: ['reviewAllPrivateCloudRequests'],
        data: {
          requestId: String(req._id),
          licencePlate: req.licencePlate,
        },
        createdAt,
      });
    }

    const publicCloudRequests = await db
      .collection('PublicCloudRequest')
      .find({ active: true, decisionStatus: 'PENDING' })
      .toArray();

    for (let x = 0; x < publicCloudRequests.length; x++) {
      const req = publicCloudRequests[x];
      await db.collection('Task').insertOne({
        type: 'REVIEW_PUBLIC_CLOUD_REQUEST',
        status: 'ASSIGNED',
        permissions: ['reviewAllPublicCloudRequests'],
        data: {
          requestId: String(req._id),
          licencePlate: req.licencePlate,
        },
        createdAt,
      });
    }
  });

  session.endSession();
};

export const down = async (db, client) => {};
