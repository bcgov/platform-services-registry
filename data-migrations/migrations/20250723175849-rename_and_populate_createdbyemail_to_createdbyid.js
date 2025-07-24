export const up = async (db, client) => {
  const usersCollection = db.collection('User');

  const users = await usersCollection.find({}).toArray();
  const emailToIdMap = users.reduce((map, user) => {
    if (user.email) {
      map[user.email] = user._id;
    }
    return map;
  }, {});

  const collections = ['PrivateCloudRequest', 'PublicCloudRequest'];

  for (const collectionName of collections) {
    const collection = db.collection(collectionName);
    const documents = await collection.find({}).toArray();

    for (const doc of documents) {
      const updateFields = {};

      if (!doc.createdById && doc.createdByEmail && emailToIdMap[doc.createdByEmail]) {
        updateFields.createdById = emailToIdMap[doc.createdByEmail];
      }

      if (!doc.decisionMakerId && doc.decisionMakerEmail && emailToIdMap[doc.decisionMakerEmail]) {
        updateFields.decisionMakerId = emailToIdMap[doc.decisionMakerEmail];
      }

      if (Object.keys(updateFields).length > 0) {
        await collection.updateOne({ _id: doc._id }, { $set: updateFields });
      }
    }

    console.log(`Updated ${collectionName}: ${documents.length} documents scanned.`);
  }
};

export const down = async (db, client) => {};
