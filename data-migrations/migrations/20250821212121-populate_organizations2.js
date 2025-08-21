export const up = async (db, client) => {
  const Organization = db.collection('Organization');
  const targetCollections = [
    'PrivateCloudProduct',
    'PrivateCloudRequestData',
    'PublicCloudProduct',
    'PublicCloudRequestData',
  ];

  const organizations = await Organization.find({}).toArray();

  for (const collectionName of targetCollections) {
    const collection = db.collection(collectionName);

    for (const org of organizations) {
      const result = await collection.updateMany({ ministry: org.code }, { $set: { organizationId: org._id } });
      console.log(`Updated ${result.modifiedCount} documents in ${collectionName} for ministry ${org.code}`);
    }
  }
};

export const down = async () => {};
