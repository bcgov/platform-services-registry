function splitAccountCodingString(str) {
  if (str.length !== 24) return null;

  const segments = [3, 5, 5, 4, 7];
  const result = [];
  let start = 0;

  for (const length of segments) {
    result.push(str.slice(start, start + length));
    start += length;
  }

  return result;
}

export const up = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    const Task = db.collection('Task');
    const Billing = db.collection('Billing');
    const PublicCloudBilling = db.collection('PublicCloudBilling');
    const PublicCloudProject = db.collection('PublicCloudProject');

    const products = await PublicCloudProject.find().toArray();
    const oldBillings = await Billing.find().toArray();

    const accountCodingMap = {};
    const licencePlateMap = {};
    const newBillingDataSet = [];

    // 1. Gather billing data from the existing billing collection.
    oldBillings.forEach(
      ({
        _id,
        licencePlate,
        accountCoding,
        expenseAuthorityId,
        signed,
        signedById,
        signedAt,
        approved,
        approvedAt,
        approvedById,
        createdAt,
        updatedAt,
      }) => {
        const accountCodingSegments = splitAccountCodingString(accountCoding);
        if (!accountCodingSegments) return;

        const accountCodingObj = {
          cc: accountCodingSegments[0],
          rc: accountCodingSegments[1],
          sl: accountCodingSegments[2],
          stob: accountCodingSegments[3],
          pc: accountCodingSegments[4],
        };

        accountCodingMap[String(_id)] = accountCodingObj;
        if (!licencePlate || !expenseAuthorityId) return;

        licencePlateMap[licencePlate] = true;
        newBillingDataSet.push({
          licencePlate,
          expenseAuthorityId,
          accountCoding: accountCodingObj,
          signed,
          signedById,
          signedAt,
          approved,
          approvedAt,
          approvedById,
          createdAt,
          updatedAt,
        });
      },
    );

    const newTaskSet = [];

    // 2. Gather billing data from the existing product collection for products waived by another product.
    products.forEach(({ licencePlate, expenseAuthorityId, billingId, createdAt }) => {
      const accountCoding = accountCodingMap[String(billingId)];
      if (!accountCoding || !licencePlate || !expenseAuthorityId) return;
      if (licencePlateMap[licencePlate]) return;

      newBillingDataSet.push({
        licencePlate,
        expenseAuthorityId,
        accountCoding,
        signed: false,
        approved: false,
        createdAt,
        updatedAt: createdAt,
      });

      newTaskSet.push({
        type: 'SIGN_PUBLIC_CLOUD_MOU',
        status: 'ASSIGNED',
        userIds: [expenseAuthorityId],
        data: { licencePlate },
        createdAt,
      });
    });

    if (newBillingDataSet.length === 0) return;

    const result = await Promise.all([
      PublicCloudBilling.insertMany(newBillingDataSet, {}),
      newTaskSet.length > 0 && Task.insertMany(newTaskSet, {}),
    ]);

    console.log('migrate_public_cloud_billings:', result);
  });

  session.endSession();
};

export const down = async (db, client) => {};
