export const up = async (db, client) => {
  const privateProjectProm = db
    .collection('PrivateCloudProduct')
    .updateMany({ golddrEnabled: { $exists: false } }, [{ $set: { golddrEnabled: true } }]);

  const privateRequestProm = db
    .collection('PrivateCloudRequestData')
    .updateMany({ golddrEnabled: { $exists: false } }, [{ $set: { golddrEnabled: true } }]);

  const result = await Promise.all([privateProjectProm, privateRequestProm]);

  console.log('add_golddr_enabled_field:', result);
};

export const down = async (db, client) => {};
