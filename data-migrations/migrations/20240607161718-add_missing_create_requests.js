export const up = async (db, client) => {
  const session = client.startSession();

  await session.withTransaction(async () => {
    const privateCloudProducts = await db.collection('PrivateCloudProject').find({}).sort({ createdAt: 1 }).toArray();

    const result = [];

    await Promise.all(
      privateCloudProducts.map(async (product) => {
        const count = await db.collection('PrivateCloudRequest').count({ licencePlate: { $eq: product.licencePlate } });

        if (count === 0) {
          result.push({ licencePlate: product.licencePlate, status: product.status, createdAt: product.createdAt });

          const po = await db.collection('User').findOne({ _id: { $eq: product.projectOwnerId } });

          const reqObj = {
            name: product.name,
            description: product.description,
            status: 'ACTIVE',
            licencePlate: product.licencePlate,
            projectOwnerId: product.projectOwnerId,
            primaryTechnicalLeadId: product.primaryTechnicalLeadId,
            secondaryTechnicalLeadId: product.secondaryTechnicalLeadId,
            ministry: product.ministry,
            cluster: product.cluster,
            golddrEnabled: product.golddrEnabled,
            productionQuota: product.productionQuota,
            testQuota: product.testQuota,
            developmentQuota: product.developmentQuota,
            toolsQuota: product.toolsQuota,
            commonComponents: product.commonComponents,
            isTest: product.isTest,
            createdAt: product.createdAt,
          };

          const decisionData = await db.collection('PrivateCloudRequestedProject').insertOne({ ...reqObj });
          const requestData = await db.collection('PrivateCloudRequestedProject').insertOne({ ...reqObj });

          await db.collection('PrivateCloudRequest').insertOne({
            licencePlate: product.licencePlate,
            createdByEmail: po.email,
            type: 'CREATE',
            decisionStatus: 'PROVISIONED',
            isQuotaChanged: false,
            active: false,
            updatedAt: product.createdAt,
            decisionDataId: decisionData.insertedId,
            requestDataId: requestData.insertedId,
            decisionMakerEmail: '',
            decisionComment: '',
            decisionDate: product.createdAt,
            createdAt: product.createdAt,
          });
        }
      }),
    );

    console.log('add_missing_create_requests:', result);
  });

  session.endSession();
};

export const down = async (db, client) => {};
