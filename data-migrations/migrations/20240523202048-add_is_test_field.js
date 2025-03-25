export const up = async (db, client) => {
  const privateProjectProm = db
    .collection('PrivateCloudProject')
    .updateMany({ isTest: { $exists: false } }, [{ $set: { isTest: false } }]);

  const privateRequestedProjectProm = db
    .collection('PrivateCloudRequestedProject')
    .updateMany({ isTest: { $exists: false } }, [{ $set: { isTest: false } }]);

  const result = await Promise.all([privateProjectProm, privateRequestedProjectProm]);

  console.log('add_is_test_field:', result);
};

export const down = async (db, client) => {};
