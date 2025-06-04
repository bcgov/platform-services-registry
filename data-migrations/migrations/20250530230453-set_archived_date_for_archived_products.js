export const up = async (db, client) => {
  const session = client.startSession();
  const filteringRules = { status: 'INACTIVE' };

  const updatePipeline = [
    {
      $set: {
        archivedAt: '$updatedAt',
      },
    },
  ];
  const option = { session };

  await session.withTransaction(async () => {
    const [privateCloudProduct, publicCloudProduct] = await Promise.all([
      db.collection('PrivateCloudProduct').updateMany(filteringRules, updatePipeline, option),
      db.collection('PublicCloudProduct').updateMany(filteringRules, updatePipeline, option),
    ]);

    console.log(`Updated ${privateCloudProduct.modifiedCount} documents in PrivateCloudProduct`);
    console.log(`Updated ${publicCloudProduct.modifiedCount} documents in PublicCloudProduct`);
  });

  session.endSession();
};

export const down = async (db, client) => {};
