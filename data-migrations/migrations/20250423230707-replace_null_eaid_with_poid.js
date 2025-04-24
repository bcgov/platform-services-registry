export const up = async (db, client) => {
  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      const productResult = await db.collection('PublicCloudProduct').updateMany(
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
        { session },
      );

      const requestDataResult = await db.collection('PublicCloudRequestData').updateMany(
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
        { session },
      );
      console.log(`Updated ${productResult.modifiedCount} documents in PublicCloudProject`);
      console.log(`Updated ${requestDataResult.modifiedCount} documents in PublicCloudProject`);
    });
  } catch (error) {
    console.error('Transaction aborted due to error:', error);
  } finally {
    await session.endSession();
  }
};

export const down = async (db, client) => {};
