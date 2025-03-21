export const up = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    const privateCloudProducts = await db
      .collection('PrivateCloudProduct')
      .find({ webhookUrl: { $exists: true } })
      .project({ licencePlate: 1, webhookUrl: 1 })
      .toArray();

    const webhookDocs = privateCloudProducts
      .map((proj) => {
        return {
          licencePlate: proj.licencePlate,
          url: proj.webhookUrl,
          secret: '',
          username: '',
          password: '',
        };
      })
      .filter(({ url }) => !!url);

    if (webhookDocs.length === 0) return;
    await db.collection('PrivateCloudProductWebhook').insertMany(webhookDocs, {});
  });

  session.endSession();
};

export const down = async (db, client) => {};
