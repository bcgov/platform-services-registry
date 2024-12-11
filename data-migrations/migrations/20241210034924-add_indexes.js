export const up = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    const result = await Promise.all([
      db.collection('User').createIndex({ email: 1, firstName: 1, lastName: 1 }),

      db.collection('PrivateCloudProject').createIndex({ status: 1 }),
      db.collection('PrivateCloudProject').createIndex({ status: 1, licencePlate: 1, name: 1, description: 1 }),
      db.collection('PrivateCloudProject').createIndex({
        status: 1,
        licencePlate: 1,
        name: 1,
        description: 1,
        projectOwnerId: 1,
        primaryTechnicalLeadId: 1,
        secondaryTechnicalLeadId: 1,
      }),

      db.collection('PublicCloudProject').createIndex({ status: 1 }),
      db.collection('PublicCloudProject').createIndex({ status: 1, licencePlate: 1, name: 1, description: 1 }),
      db.collection('PublicCloudProject').createIndex({
        status: 1,
        licencePlate: 1,
        name: 1,
        description: 1,
        projectOwnerId: 1,
        primaryTechnicalLeadId: 1,
        secondaryTechnicalLeadId: 1,
      }),

      db.collection('PrivateCloudRequest').createIndex({ licencePlate: 1, decisionDataId: 1, decisionStatus: 1 }),
      db.collection('PrivateCloudRequest').createIndex({ decisionDataId: 1, decisionStatus: 1 }),

      db.collection('PublicCloudRequest').createIndex({ licencePlate: 1, decisionDataId: 1, decisionStatus: 1 }),
      db.collection('PublicCloudRequest').createIndex({ decisionDataId: 1, decisionStatus: 1 }),

      db.collection('PrivateCloudRequestedProject').createIndex({
        licencePlate: 1,
        name: 1,
        description: 1,
        projectOwnerId: 1,
        primaryTechnicalLeadId: 1,
        secondaryTechnicalLeadId: 1,
      }),
      db.collection('PublicCloudRequestedProject').createIndex({
        licencePlate: 1,
        name: 1,
        description: 1,
        projectOwnerId: 1,
        primaryTechnicalLeadId: 1,
        secondaryTechnicalLeadId: 1,
      }),
    ]);

    console.log('result:', result);
  });

  session.endSession();
};

export const down = async (db, client) => {};
