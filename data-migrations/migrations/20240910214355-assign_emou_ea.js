export const up = async (db, client) => {
  const billings = await db
    .collection('Billing')
    .find(
      { signed: false, $and: [{ expenseAuthorityId: { $exists: true } }, { expenseAuthorityId: { $ne: null } }] },
      {
        projection: { expenseAuthorityId: 1, licencePlate: 1 },
        sort: { createdAt: 1 },
      },
    )
    .toArray();

  const taskData = billings.map((billing) => {
    return {
      type: 'SIGN_PUBLIC_CLOUD_MOU',
      status: 'ASSIGNED',
      userIds: [String(billing.expenseAuthorityId)],
      data: {
        licencePlate: billing.licencePlate,
      },
      createdAt: new Date(),
    };
  });

  await db.collection('Task').insertMany(taskData, {});
};

export const down = async (db, client) => {};
