export const up = async (db, client) => {
  const editResult = await db
    .collection('PublicCloudRequest')
    .updateMany({ type: { $eq: 'EDIT' }, requestComment: { $exists: false }, decisionComment: { $exists: false } }, [
      { $set: { requestComment: '$adminComment' } },
    ]);

  console.log('rename_comment_fields_public_edit:', editResult);

  const createResult = await db
    .collection('PublicCloudRequest')
    .updateMany({ type: { $eq: 'CREATE' }, requestComment: { $exists: false }, decisionComment: { $exists: false } }, [
      { $set: { decisionComment: '$adminComment' } },
    ]);

  console.log('rename_comment_fields_public_create:', createResult);
};

export const down = async (db, client) => {};
