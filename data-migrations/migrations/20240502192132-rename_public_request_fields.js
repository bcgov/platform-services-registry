export const up = async (db, client) => {
  const result = await db.collection('PublicCloudRequest').updateMany(
    {
      requestDataId: { $exists: false },
      decisionDataId: { $exists: false },
    },
    {
      $rename: {
        userRequestedProjectId: 'requestDataId',
        requestedProjectId: 'decisionDataId',
      },
    },
  );

  console.log('rename_public_request_fields:', result);
};

export const down = async (db, client) => {};
