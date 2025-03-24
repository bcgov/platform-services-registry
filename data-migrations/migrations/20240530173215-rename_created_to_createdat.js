export const up = async (db, client) => {
  const schemas = [
    'User',
    'PrivateCloudRequest',
    'PrivateCloudProduct',
    'PrivateCloudRequestData',
    'PrivateCloudComment',
    'Reaction',
    'PublicCloudRequest',
    'PublicCloudProduct',
    'PublicCloudRequestData',
    'AcsResultImage',
  ];

  const proms = [];

  for (let x = 0; x < schemas.length; x++) {
    const prom = db
      .collection(schemas[x])
      .updateMany({ createdAt: { $exists: false } }, { $rename: { created: 'createdAt' } });

    proms.push(prom);
  }

  const result = await Promise.all(proms);

  console.log('rename_created_to_createdat:', result);
};

export const down = async (db, client) => {};
