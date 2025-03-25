export const up = async (db, client) => {
  // Fetch data for all collections (names only)
  const collections = await db.listCollections({}, { nameOnly: true }).toArray();

  const renames = [
    { oldName: 'PrivateCloudProject', newName: 'PrivateCloudProduct' },
    { oldName: 'PrivateCloudRequestedProject', newName: 'PrivateCloudRequestData' },
    { oldName: 'PublicCloudProject', newName: 'PublicCloudProduct' },
    { oldName: 'PublicCloudRequestedProject', newName: 'PublicCloudRequestData' },
  ];

  for (const { oldName, newName } of renames) {
    const target = collections.find((col) => col.name === oldName);
    if (target) {
      await db.collection(oldName).rename(newName, { dropTarget: true });
      console.log(`Renamed collection ${oldName} to ${newName}`);
    } else {
      console.log(`Collection ${oldName} not found; skipping.`);
    }
  }
};

export const down = async (db, client) => {};
