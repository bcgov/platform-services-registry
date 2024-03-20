export const up = async (db, client) => {
  async function update(collectionName) {
    ['commonComponents.other'].map(async (key) => {
      await db
        .collection(collectionName)
        .updateMany({ $or: [{ [key]: { $exists: false } }, { [key]: { $eq: null } }] }, [{ $set: { [key]: '' } }]);
    });
  }

  await update('PrivateCloudProject');
  await update('PrivateCloudRequestedProject');
};

export const down = async (db, client) => {};
