export const up = async (db, client) => {
  const usersCollection = db.collection('User');

  await Promise.all(
    ['PrivateCloudRequest', 'PublicCloudRequest'].map(async (collectionName) => {
      const collection = db.collection(collectionName);
      const renameMap = {
        createdByEmail: 'createdById',
        decisionMakerEmail: 'decisionMakerId',
      };
      const updateQuery = { $rename: renameMap };

      await collection.updateMany({}, updateQuery);

      const documents = await collection.find({}).toArray();

      for (const doc of documents) {
        const updateFields = {};

        if (doc.createdById) {
          const user = await usersCollection.findOne({ email: doc.createdById });
          if (user) updateFields.createdById = user._id;
        }

        if (doc.decisionMakerId) {
          const user = await usersCollection.findOne({ email: doc.decisionMakerId });
          if (user) updateFields.decisionMakerId = user._id;
        }

        if (Object.keys(updateFields).length > 0) {
          await collection.updateOne({ _id: doc._id }, { $set: updateFields });
        }
      }

      console.log(`Processed ${documents.length} documents in ${collectionName}`);
    }),
  );
};

export const down = async (db, client) => {};
