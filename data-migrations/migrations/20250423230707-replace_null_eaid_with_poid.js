export const up = async (db, client) => {
  const session = client.startSession();
  const filteringRules = {
    $or: [{ expenseAuthorityId: null }, { expenseAuthorityId: { $exists: false } }, { expenseAuthorityId: '' }],
  };
  const updatePipeline = [
    {
      $set: {
        expenseAuthorityId: '$projectOwnerId',
      },
    },
  ];
  const option = { session };

  await session.withTransaction(async () => {
    const [productResult, requestDataResult] = await Promise.all([
      db.collection('PublicCloudProduct').updateMany(filteringRules, updatePipeline, option),
      db.collection('PublicCloudRequestData').updateMany(filteringRules, updatePipeline, option),
    ]);

    console.log(`Updated ${productResult.modifiedCount} documents in PublicCloudProduct`);
    console.log(`Updated ${requestDataResult.modifiedCount} documents in PublicCloudRequestData`);
  });

  session.endSession();
};

export const down = async (db, client) => {};
