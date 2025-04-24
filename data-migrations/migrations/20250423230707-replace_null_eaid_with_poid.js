export const up = async (db, client) => {
  const collectionNames = ['PublicCloudProduct', 'PublicCloudRequestData'];
  await Promise.all(
    collectionNames.map(async (collectionName) => {
      const collection = await db.collection(collectionName);
      const documentToUpdate = await collection
        .find({
          $or: [{ expenseAuthorityId: null }, { expenseAuthorityId: { $exists: false } }, { expenseAuthorityId: '' }],
        })
        .toArray();
      console.log(`Updating ${documentToUpdate.length} documents in ${collectionName}`);

      await Promise.all(
        documentToUpdate.map((doc) => {
          collection.updateOne({ _id: doc._id }, { $set: { expenseAuthorityId: doc.projectOwnerId } });
        }),
      );
      console.log(`Finished Updating ${collectionName}`);
    }),
  );
};

export const down = async (db, client) => {};
