export const up = async (db, client) => {
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      const PublicCloudProduct = db.collection('PublicCloudProduct');
      const PublicCloudRequestData = db.collection('PublicCloudRequestData');

      const networkingUpdatePipeline = [
        {
          $set: {
            requiresNetworking: true,
            networkingReason: 'Legacy project',

            'environmentsEnabled.productionRequiresNetworking': {
              $cond: [
                { $eq: ['$environmentsEnabled.production', true] },
                true,
                '$environmentsEnabled.productionRequiresNetworking',
              ],
            },
            'environmentsEnabled.developmentRequiresNetworking': {
              $cond: [
                { $eq: ['$environmentsEnabled.development', true] },
                true,
                '$environmentsEnabled.developmentRequiresNetworking',
              ],
            },
            'environmentsEnabled.testRequiresNetworking': {
              $cond: [
                { $eq: ['$environmentsEnabled.test', true] },
                true,
                '$environmentsEnabled.testRequiresNetworking',
              ],
            },
            'environmentsEnabled.toolsRequiresNetworking': {
              $cond: [
                { $eq: ['$environmentsEnabled.tools', true] },
                true,
                '$environmentsEnabled.toolsRequiresNetworking',
              ],
            },
          },
        },
      ];

      const productResult = await PublicCloudProduct.updateMany({ provider: 'AZURE' }, networkingUpdatePipeline, {
        session,
      });

      const requestDataResult = await PublicCloudRequestData.updateMany(
        { provider: 'AZURE' },
        networkingUpdatePipeline,
        { session },
      );

      console.log(
        `backfill_azure_networking: Updated ${productResult.modifiedCount} PublicCloudProduct documents and ${requestDataResult.modifiedCount} PublicCloudRequestData documents.`,
      );
    });
  } catch (error) {
    console.error('An error occurred while processing the database transaction:', error);
    throw error;
  } finally {
    await session.endSession();
  }
};

export const down = async (db, client) => {};
