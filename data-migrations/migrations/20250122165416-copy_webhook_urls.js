export const up = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    const privateCloudProjects = await db
      .collection('PrivateCloudProject')
      .find({ webhookUrl: { $exists: true } })
      .project({ licencePlate: 1, webhookUrl: 1 })
      .toArray();

    const webhookDocs = privateCloudProjects
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

    await db.collection('PrivateCloudProductWebhook').insertMany(webhookDocs, {});
  });

  session.endSession();
};

export const down = async (db, client) => {};
