export const up = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    const createdAt = new Date();

    const publicCloudRequests = await db
      .collection('PublicCloudRequest')
      .find({ active: true, decisionStatus: 'PENDING' })
      .toArray();

    for (let x = 0; x < publicCloudRequests.length; x++) {
      const req = publicCloudRequests[x];
      const query = {
        type: 'REVIEW_PUBLIC_CLOUD_REQUEST',
        permissions: ['reviewAllPublicCloudRequests'],
        data: {
          requestId: String(req._id),
          licencePlate: req.licencePlate,
        },
      };

      await db.collection('Task').updateOne(
        query,
        {
          $set: {
            ...query,
            status: 'ASSIGNED',
            createdAt,
          },
        },
        {
          upsert: true,
        },
      );
    }
  });

  session.endSession();
};

export const down = async (db, client) => {};
