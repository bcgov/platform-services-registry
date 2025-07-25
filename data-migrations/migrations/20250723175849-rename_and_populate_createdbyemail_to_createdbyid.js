export const up = async (db, client) => {
  const collections = ['PrivateCloudRequest', 'PublicCloudRequest'];
  const usersCollection = db.collection('User');

  for (const collectionName of collections) {
    const collection = db.collection(collectionName);
    const documents = await collection.find({}).toArray();

    const uniqueEmails = new Set();

    for (const doc of documents) {
      if (doc.createdByEmail) {
        uniqueEmails.add(doc.createdByEmail);
      }
      if (doc.decisionMakerEmail) {
        uniqueEmails.add(doc.decisionMakerEmail);
      }
    }

    const emails = [...uniqueEmails];

    const users = await usersCollection.find({ email: { $in: emails } }).toArray();

    const emailToIdMap = users.reduce((map, user) => {
      if (user.email) {
        map[user.email] = user._id;
      }
      return map;
    }, {});

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
