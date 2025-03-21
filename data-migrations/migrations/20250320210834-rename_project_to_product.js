export const up = async (db, client) => {
  // Rename collection: privateCloudProduct → PrivateCloudProduct
  const oldprivateCloudProduct = await db.listCollections({ name: 'privateCloudProduct' }).toArray();
  if (oldprivateCloudProduct.length > 0) {
    await db.collection('privateCloudProduct').rename('PrivateCloudProduct');
    console.log('Renamed collection privateCloudProduct to PrivateCloudProduct');
  }

  // Rename collection: PrivateCloudRequestedProject → PrivateCloudRequestData
  const oldPrivateCloudRequestedProject = await db.listCollections({ name: 'PrivateCloudRequestedProject' }).toArray();
  if (oldPrivateCloudRequestedProject.length > 0) {
    await db.collection('PrivateCloudRequestedProject').rename('PrivateCloudRequestData');
    console.log('Renamed collection PrivateCloudRequestedProject to PrivateCloudRequestData');
  }

  // Rename collection: publicCloudProduct → PublicCloudProduct
  const oldpublicCloudProduct = await db.listCollections({ name: 'publicCloudProduct' }).toArray();
  if (oldpublicCloudProduct.length > 0) {
    await db.collection('publicCloudProduct').rename('PublicCloudProduct');
    console.log('Renamed collection publicCloudProduct to PublicCloudProduct');
  }

  // Rename collection: PublicCloudRequestedProject → PublicCloudRequestData
  const oldPublicCloudRequestedProject = await db.listCollections({ name: 'PublicCloudRequestedProject' }).toArray();
  if (oldPublicCloudRequestedProject.length > 0) {
    await db.collection('PublicCloudRequestedProject').rename('PublicCloudRequestData');
    console.log('Renamed collection PublicCloudRequestedProject to PublicCloudRequestData');
  }
};
