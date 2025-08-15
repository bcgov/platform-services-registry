export const up = async (db, client) => {
  const targetCollections = [
    'PublicCloudProduct',
    'PublicCloudRequestData',
    'PrivateCloudProduct',
    'PrivateCloudRequestData',
  ];

  const Organization = db.collection('Organization');

  const newOrganization = await Organization.findOne({ code: 'AGRI' });
  const oldOrganization = await Organization.findOne({ code: 'LDB' });

  for (const collectionName of targetCollections) {
    const collection = db.collection(collectionName);

    const result = await collection.updateMany({ organizationId: oldOrganization._id }, [
      {
        $set: {
          organizationId: newOrganization._id,
          ministry: newOrganization.code,
        },
      },
    ]);

    console.log(`Updated ${result.modifiedCount} documents in ${collectionName}`);
  }
};

export const down = async (db, client) => {};
