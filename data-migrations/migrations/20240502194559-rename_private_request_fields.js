export const up = async (db, client) => {
  const result = await db
    .collection('PrivateCloudRequest')
    .updateMany({ requestDataId: { $exists: false }, decisionDataId: { $exists: false } }, [
      { $set: { requestDataId: '$userRequestedProjectId', decisionDataId: '$requestedProjectId' } },
    ]);

  //     const result = await db.collection('PrivateCloudRequest')
  //     .updateMany({}, {
  //         $rename: {
  //           'userRequestedProjectId': 'requestDataId',
  //           'requestedProjectId': 'decisionDataId',
  //         },
  //       })

  console.log('rename_private_request_fields:', result);
};

export const down = async (db, client) => {};
