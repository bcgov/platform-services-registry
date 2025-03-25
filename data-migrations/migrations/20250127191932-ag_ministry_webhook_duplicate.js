export const up = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    const PrivateCloudProductWebhook = db.collection('PrivateCloudProductWebhook');
    const PrivateCloudProject = db.collection('PrivateCloudProject');

    const baseWebhook = await PrivateCloudProductWebhook.findOne({ licencePlate: { $eq: 'e5ced5' } });
    if (!baseWebhook) return;

    const targetProducts = await PrivateCloudProject.find({
      ministry: { $in: ['AG', 'PSSG', 'EMBC'] },
      status: { $eq: 'ACTIVE' },
    })
      .project({ licencePlate: 1 })
      .toArray();

    const webhookDocsToCopy = targetProducts.map(({ licencePlate }) => {
      return {
        licencePlate,
        url: baseWebhook.url,
        secret: baseWebhook.secret ?? '',
        username: baseWebhook.username ?? '',
        password: baseWebhook.password ?? '',
      };
    });

    if (webhookDocsToCopy.length === 0) return;

    const targetLicensePlates = targetProducts.map(({ licencePlate }) => licencePlate);
    await PrivateCloudProductWebhook.deleteMany({ licencePlate: { $in: targetLicensePlates } });

    const result = await PrivateCloudProductWebhook.insertMany(webhookDocsToCopy, {});
    console.log('renamag_ministry_webhook_duplicate:', result);
  });

  session.endSession();
};

export const down = async (db, client) => {};
