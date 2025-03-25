export const up = async (db, client) => {
  await Promise.all([
    db
      .collection('PublicCloudRequestedProject')
      .updateMany(
        { $or: [{ providerSelectionReasonsNote: null }, { providerSelectionReasonsNote: { $exists: false } }] },
        { $set: { providerSelectionReasonsNote: '' } },
      ),
    db
      .collection('PublicCloudProject')
      .updateMany(
        { $or: [{ providerSelectionReasonsNote: null }, { providerSelectionReasonsNote: { $exists: false } }] },
        { $set: { providerSelectionReasonsNote: '' } },
      ),
  ]);
};

export const down = async (db, client) => {};
