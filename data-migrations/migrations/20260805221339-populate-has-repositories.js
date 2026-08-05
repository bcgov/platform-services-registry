export const up = async (db, client) => {
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      const PrivateCloudProduct = db.collection('PrivateCloudProduct');
      const PrivateCloudRequestData = db.collection('PrivateCloudRequestData');
      const PublicCloudProduct = db.collection('PublicCloudProduct');
      const PublicCloudRequestData = db.collection('PublicCloudRequestData');

      const repositoryFilter = {
        'repositories.0': {
          $exists: true,
        },
        hasRepositories: {
          $ne: true,
        },
      };

      const repositoryUpdate = {
        $set: {
          hasRepositories: true,
        },
      };

      const privateProductResult = await PrivateCloudProduct.updateMany(repositoryFilter, repositoryUpdate, {
        session,
      });

      const privateRequestDataResult = await PrivateCloudRequestData.updateMany(repositoryFilter, repositoryUpdate, {
        session,
      });

      const publicProductResult = await PublicCloudProduct.updateMany(repositoryFilter, repositoryUpdate, {
        session,
      });

      const publicRequestDataResult = await PublicCloudRequestData.updateMany(repositoryFilter, repositoryUpdate, {
        session,
      });

      console.log(
        [
          'populate_has_repositories:',
          `Updated ${privateProductResult.modifiedCount} PrivateCloudProduct documents,`,
          `${privateRequestDataResult.modifiedCount} PrivateCloudRequestData documents,`,
          `${publicProductResult.modifiedCount} PublicCloudProduct documents,`,
          `and ${publicRequestDataResult.modifiedCount} PublicCloudRequestData documents.`,
        ].join(' '),
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
