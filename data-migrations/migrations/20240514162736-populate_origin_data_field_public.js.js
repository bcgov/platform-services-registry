export const up = async (db, client) => {
  try {
    const session = client.startSession();

    await session.withTransaction(async () => {
      const PublicCloudRequest = db.collection('PublicCloudRequest');

      const publicCloudRequests = await PublicCloudRequest.aggregate([
        {
          $group: {
            _id: '$licencePlate',
            totalAmount: { $sum: 1 },
          },
        },
      ]).toArray();

      for (const requestsLicencePlate of publicCloudRequests) {
        if (requestsLicencePlate.totalAmount > 1) {
          const publicCloudRequestsLicencePlate = await PublicCloudRequest.find({
            licencePlate: requestsLicencePlate._id,
          })
            .sort({ created: -1 })
            .toArray();

          for (let index = 1; index < publicCloudRequestsLicencePlate.length; index++) {
            const request = publicCloudRequestsLicencePlate[index];
            if (request.type !== 'CREATE') {
              await PublicCloudRequest.updateOne(
                { _id: request._id },
                { $set: { originalDataId: publicCloudRequestsLicencePlate[index - 1].decisionDataId } },
              );
            }
          }
        }
      }

      console.log('add_original_data_id_fields_public: Original data IDs have been updated successfully.');
    });

    session.endSession();
  } catch (error) {
    console.error('An error occurred while processing the database transaction:', error);
  }
};

export const down = async (db, client) => {};
