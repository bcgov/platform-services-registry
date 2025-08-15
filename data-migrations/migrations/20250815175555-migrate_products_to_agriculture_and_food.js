export const up = async (db, client) => {
  const targetCollections = [
    'PublicCloudProduct',
    'PublicCloudRequestData',
    'PrivateCloudProduct',
    'PrivateCloudRequestData',
  ];

  const Organization = db.collection('Organization');

  const newOrganization = await Organization.findOne({ code: 'AGRI' });
  const licencePlates = ['bf4ebe', 'b7aa30', 'beb0bd'];

  for (const collectionName of targetCollections) {
    const collection = db.collection(collectionName);

    const result = await collection.updateMany({ licencePlate: { $exists: true, $in: licencePlates } }, [
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
