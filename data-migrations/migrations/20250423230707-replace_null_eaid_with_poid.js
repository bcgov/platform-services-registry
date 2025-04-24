export const up = async (db, client) => {
  const PublicCloudProductProm = db.collection('PublicCloudProduct').updateMany(
    {
      $or: [{ expenseAuthorityId: null }, { expenseAuthorityId: { $exists: false } }, { expenseAuthorityId: '' }],
    },
    [
      {
        $set: {
          expenseAuthorityId: '$projectOwnerId',
        },
      },
    ],
  );

  const PublicCloudRequestDataProm = db.collection('PublicCloudRequestData').updateMany(
    {
      $or: [{ expenseAuthorityId: null }, { expenseAuthorityId: { $exists: false } }, { expenseAuthorityId: '' }],
    },
    [
      {
        $set: {
          expenseAuthorityId: '$projectOwnerId',
        },
      },
    ],
  );

  const [productResult, requestDataResult] = await Promise.all([PublicCloudProductProm, PublicCloudRequestDataProm]);

  console.log(`Updated ${productResult.modifiedCount} documents in PublicCloudProject`);
  console.log(`Updated ${requestDataResult.modifiedCount} documents in PublicCloudProject`);
};

export const down = async (db, client) => {};
