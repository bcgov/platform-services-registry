export const up = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    const Task = db.collection('Task');
    const User = db.collection('User');
    const PublicCloudBilling = db.collection('PublicCloudBilling');

    const allUserIds = await User.distinct('_id');
    if (!allUserIds.length) return;

    const result = await Promise.all([
      PublicCloudBilling.deleteMany({ expenseAuthorityId: { $nin: allUserIds } }),
      Task.deleteMany({
        userIds: {
          $size: 1,
          $not: { $elemMatch: { $in: allUserIds } },
        },
      }),
    ]);

    console.log('invalid_public_cloud_billings:', result);
  });

  session.endSession();
};

export const down = async (db, client) => {};
