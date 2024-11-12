export const up = async (db, client) => {
  await Promise.all([
    db.collection('Task').updateMany({ type: 'SIGN_MOU' }, { $set: { type: 'SIGN_PUBLIC_CLOUD_MOU' } }),
    db.collection('Task').updateMany({ type: 'REVIEW_MOU' }, { $set: { type: 'REVIEW_PUBLIC_CLOUD_MOU' } }),
  ]);
};

export const down = async (db, client) => {};
