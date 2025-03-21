export const up = async (db, client) => {
  await Promise.all([
    db
      .collection('PublicCloudRequestData')
      .updateMany(
        { $or: [{ providerSelectionReasonsNote: null }, { providerSelectionReasonsNote: { $exists: false } }] },
        { $set: { providerSelectionReasonsNote: '' } },
      ),
    db
      .collection('PublicCloudProduct')
      .updateMany(
        { $or: [{ providerSelectionReasonsNote: null }, { providerSelectionReasonsNote: { $exists: false } }] },
        { $set: { providerSelectionReasonsNote: '' } },
      ),
  ]);
};

export const down = async (db, client) => {};
