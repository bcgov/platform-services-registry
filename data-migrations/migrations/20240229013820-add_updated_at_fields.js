export const up = async (db, client) => {
  const privateProjectProm = db
    .collection('PrivateCloudProject')
    .updateMany({ updatedAt: { $exists: false } }, [{ $set: { updatedAt: '$created' } }]);

  const privateRequestProm = db
    .collection('PrivateCloudRequest')
    .updateMany({ updatedAt: { $exists: false } }, [{ $set: { updatedAt: '$created' } }]);

  const publicProjectProm = db
    .collection('PublicCloudProject')
    .updateMany({ updatedAt: { $exists: false } }, [{ $set: { updatedAt: '$created' } }]);

  const publicRequestProm = db
    .collection('PublicCloudRequest')
    .updateMany({ updatedAt: { $exists: false } }, [{ $set: { updatedAt: '$created' } }]);

  const result = await Promise.all([privateProjectProm, privateRequestProm, publicProjectProm, publicRequestProm]);

  console.log('add_updated_at_fields:', result);
};

export const down = async (db, client) => {};
