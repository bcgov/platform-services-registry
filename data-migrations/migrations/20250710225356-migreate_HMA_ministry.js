export const up = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    const result = await Promise.all(
      ['PrivateCloudProduct', 'PrivateCloudRequestData', 'PublicCloudProduct', 'PublicCloudRequestData'].map(
        (schemaName) => {
          return db
            .collection(schemaName)
            .updateMany({ ministry: { $in: ['MAH', 'HOUS'] } }, [{ $set: { ministry: 'HMA' } }], { session });
        },
      ),
    );

    console.log('migreate_HMA_ministry:', result);
  });

  session.endSession();
};

export const down = async (db, client) => {};
