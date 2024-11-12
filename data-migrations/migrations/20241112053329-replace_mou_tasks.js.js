export const up = async (db, client) => {
  await Promise.all([
    db.collection('Task').updateMany({ type: 'SIGN_MOU' }, { $set: { type: 'SIGN_PRIVATE_CLOUD_MOU' } }),
    db.collection('Task').updateMany({ type: 'REVIEW_MOU' }, { $set: { type: 'REVIEW_PRIVATE_CLOUD_MOU' } }),
  ]);
};

export const down = async (db, client) => {};
