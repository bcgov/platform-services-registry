export const up = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    const result = await Promise.all(
      ['PrivateCloudProduct', 'PrivateCloudRequestData'].map((schemaName) => {
        return db
          .collection(schemaName)
          .updateMany({ ministry: 'EMBC' }, [{ $set: { ministry: 'EMCR' } }], { session });
      }),
    );

    console.log('rename_embc_emcr:', result);
  });

  session.endSession();
};

export const down = async (db, client) => {};
