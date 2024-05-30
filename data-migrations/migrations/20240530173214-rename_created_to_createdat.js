export const up = async (db, client) => {
  const privateRequestProm = db
    .collection('PrivateCloudRequest')
    .updateMany({ createdAt: { $exists: false } }, { $rename: { created: 'createdAt' } });

  const publicRequestProm = db
    .collection('PublicCloudRequest')
    .updateMany({ createdAt: { $exists: false } }, { $rename: { created: 'createdAt' } });

  const result = await Promise.all([privateRequestProm, publicRequestProm]);

  console.log('rename_created_to_createdat:', result);
};

export const down = async (db, client) => {};
