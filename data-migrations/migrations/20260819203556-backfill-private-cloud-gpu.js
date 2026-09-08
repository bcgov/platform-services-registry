export const up = async (db, client) => {
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      const PrivateCloudProduct = db.collection('PrivateCloudProduct');
      const PrivateCloudRequestData = db.collection('PrivateCloudRequestData');

      const gpuBackfillPipeline = [
        {
          $set: {
            'resourceRequests.development.gpu': {
              $ifNull: ['$resourceRequests.development.gpu', 0],
            },
            'resourceRequests.test.gpu': {
              $ifNull: ['$resourceRequests.test.gpu', 0],
            },
            'resourceRequests.production.gpu': {
              $ifNull: ['$resourceRequests.production.gpu', 0],
            },
            'resourceRequests.tools.gpu': {
              $ifNull: ['$resourceRequests.tools.gpu', 0],
            },
          },
        },
      ];

      const productResult = await PrivateCloudProduct.updateMany({}, gpuBackfillPipeline, {
        session,
      });

      const requestDataResult = await PrivateCloudRequestData.updateMany({}, gpuBackfillPipeline, {
        session,
      });

      console.log(
        `backfill_private_cloud_gpu: Updated ${productResult.modifiedCount} PrivateCloudProduct documents and ${requestDataResult.modifiedCount} PrivateCloudRequestData documents.`,
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
