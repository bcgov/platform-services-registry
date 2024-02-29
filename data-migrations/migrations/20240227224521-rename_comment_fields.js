export const up = async (db, client) => {
  const result = await db
    .collection('PrivateCloudRequest')
    .updateMany({ requestComment: { $exists: false }, decisionComment: { $exists: false } }, [
      { $set: { requestComment: '$userComment', decisionComment: '$humanComment' } },
    ]);

  console.log('rename_comment_fields:', result);
};

export const down = async (db, client) => {};
