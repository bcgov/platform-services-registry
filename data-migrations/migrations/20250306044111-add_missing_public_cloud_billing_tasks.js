export const up = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    const Task = db.collection('Task');
    const PublicCloudBilling = db.collection('PublicCloudBilling');

    const billings = await PublicCloudBilling.find({ signed: false, approved: false }).toArray();

    const newTaskSet = [];
    for (const billing of billings) {
      const { expenseAuthorityId, licencePlate, createdAt } = billing;

      const task = await Task.findOne({
        type: 'SIGN_PUBLIC_CLOUD_MOU',
        status: 'ASSIGNED',
        userIds: { $in: [expenseAuthorityId] },
        'data.licencePlate': licencePlate,
      });

      if (!task) {
        newTaskSet.push({
          type: 'SIGN_PUBLIC_CLOUD_MOU',
          status: 'ASSIGNED',
          userIds: [expenseAuthorityId],
          data: { licencePlate },
          createdAt,
        });
      }
    }

    if (newTaskSet.length === 0) return;

    const result = await Task.insertMany(newTaskSet, {});
    console.log('invalid_public_cloud_billings:', result);
  });

  session.endSession();
};

export const down = async (db, client) => {};
