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

  // 1. Iterate all public cloud products
  // 2. Find all billings for each public cloud product
  // 3. Create a new billing if a product does not have a billing
  // 4. Create a new task for the new billing
  await session.withTransaction(async () => {
    const Task = db.collection('Task');
    const PublicCloudBilling = db.collection('PublicCloudBilling');
    const PublicCloudProduct = db.collection('PublicCloudProduct');

    const products = await PublicCloudProduct.find().toArray();

    const newBillingDataSet = [];
    const newTaskSet = [];

    await Promise.all(
      products.map(async ({ licencePlate, expenseAuthorityId, accountCoding }) => {
        if (!accountCoding || !expenseAuthorityId) return;

        const billings = await PublicCloudBilling.find({ licencePlate }).toArray();
        if (billings.length > 0) return;

        const accountCodingSegments = splitAccountCodingString(accountCoding);
        if (!accountCodingSegments) return;

        const accountCodingObj = {
          cc: accountCodingSegments[0],
          rc: accountCodingSegments[1],
          sl: accountCodingSegments[2],
          stob: accountCodingSegments[3],
          pc: accountCodingSegments[4],
        };

        newBillingDataSet.push({
          licencePlate,
          expenseAuthorityId,
          accountCoding: accountCodingObj,
          signed: false,
          approved: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        newTaskSet.push({
          type: 'SIGN_PUBLIC_CLOUD_MOU',
          status: 'ASSIGNED',
          userIds: [expenseAuthorityId],
          data: { licencePlate },
          createdAt: new Date(),
        });
      }),
    );

    if (newBillingDataSet.length === 0) return;

    const result = await Promise.all([
      PublicCloudBilling.insertMany(newBillingDataSet, {}),
      newTaskSet.length > 0 && Task.insertMany(newTaskSet, {}),
    ]);

    console.log('create_missing_billings:', result);
  });

  session.endSession();
};

export const down = async (db, client) => {};
