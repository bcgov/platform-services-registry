export const up = async (db, client) => {
  // Rename collection: PrivateCloudProject → PrivateCloudProduct
  const oldPrivateCloudProject = await db.listCollections({ name: 'PrivateCloudProject' }).toArray();
  if (oldPrivateCloudProject.length > 0) {
    await db.collection('PrivateCloudProject').rename('PrivateCloudProduct');
    console.log('Renamed collection PrivateCloudProject to PrivateCloudProduct');
  }

  // Rename collection: PrivateCloudRequestedProject → PrivateCloudRequestData
  const oldPrivateCloudRequestedProject = await db.listCollections({ name: 'PrivateCloudRequestedProject' }).toArray();
  if (oldPrivateCloudRequestedProject.length > 0) {
    await db.collection('PrivateCloudRequestedProject').rename('PrivateCloudRequestData');
    console.log('Renamed collection PrivateCloudRequestedProject to PrivateCloudRequestData');
  }

  // Rename collection: PublicCloudProject → PublicCloudProduct
  const oldPublicCloudProject = await db.listCollections({ name: 'PublicCloudProject' }).toArray();
  if (oldPublicCloudProject.length > 0) {
    await db.collection('PublicCloudProject').rename('PublicCloudProduct');
    console.log('Renamed collection PublicCloudProject to PublicCloudProduct');
  }

  // Rename collection: PublicCloudRequestedProject → PublicCloudRequestData
  const oldPublicCloudRequestedProject = await db.listCollections({ name: 'PublicCloudRequestedProject' }).toArray();
  if (oldPublicCloudRequestedProject.length > 0) {
    await db.collection('PublicCloudRequestedProject').rename('PublicCloudRequestData');
    console.log('Renamed collection PublicCloudRequestedProject to PublicCloudRequestData');
  }
};
