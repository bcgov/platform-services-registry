export const up = async (db, client) => {
  const privateProjectProm = db
    .collection('PrivateCloudProject')
    .updateMany({ cluster: { $ne: 'GOLD' } }, [{ $set: { golddrEnabled: false } }]);

  const privateRequestProm = db
    .collection('PrivateCloudRequestedProject')
    .updateMany({ cluster: { $ne: 'GOLD' } }, [{ $set: { golddrEnabled: false } }]);

  const result = await Promise.all([privateProjectProm, privateRequestProm]);

  console.log('update_golddr_enabled_field:', result);
};

export const down = async (db, client) => {};
