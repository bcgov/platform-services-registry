export const up = async (db, client) => {
  try {
    const session = client.startSession();

    await session.withTransaction(async () => {
      const PrivateCloudRequest = db.collection('PrivateCloudRequest');

      const privateCloudRequests = await PrivateCloudRequest.aggregate([
        {
          $group: {
            _id: '$licencePlate',
            totalAmount: { $sum: 1 },
          },
        },
      ]).toArray();

      for (const requestsLicencePlate of privateCloudRequests) {
        if (requestsLicencePlate.totalAmount > 1) {
          const privateCloudRequestsLicencePlate = await PrivateCloudRequest.find({
            licencePlate: requestsLicencePlate._id,
          })
            .sort({ created: 1 })
            .toArray();

          for (let index = 1; index < privateCloudRequestsLicencePlate.length; index++) {
            const request = privateCloudRequestsLicencePlate[index];
            if (request.type !== 'CREATE') {
              await PrivateCloudRequest.updateOne(
                { _id: request._id },
                { $set: { originalDataId: privateCloudRequestsLicencePlate[index - 1].decisionDataId } },
              );
            }
          }
        }
      }

      console.log('add_original_data_id_fields_private: Original data IDs have been updated successfully.');
    });

    session.endSession();
  } catch (error) {
    console.error('An error occurred while processing the database transaction:', error);
  }
};

export const down = async (db, client) => {};
