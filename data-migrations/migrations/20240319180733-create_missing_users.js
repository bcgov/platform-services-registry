export const up = async (db, client) => {
  const placeholderUser = await db.collection('User').insertOne({
    firstName: 'Placeholer',
    lastName: 'App',
    email: 'placeholder.app@gov.bc.ca',
    upn: 'placeholder.app@gov.bc.ca',
    idir: 'PLACEHOLDER',
    ministry: 'CITZ',
    archived: false,
    created: new Date(),
    lastSeen: new Date(),
  });

  const placeholderUserId = placeholderUser.insertedId;
  let count = 0;

  async function check(collectionName) {
    const items = await db.collection(collectionName).find({}).toArray();
    for (let x = 0; x < items.length; x++) {
      const item = items[x];
      if (item.projectOwnerId) {
        const user = await db.collection('User').findOne({ _id: { $eq: item.projectOwnerId } });
        if (!user) {
          await db
            .collection(collectionName)
            .updateOne({ _id: { $eq: item._id } }, { $set: { projectOwnerId: placeholderUserId } });

          count += 1;
        }
      }

      if (item.primaryTechnicalLeadId) {
        const user = await db.collection('User').findOne({ _id: { $eq: item.primaryTechnicalLeadId } });
        if (!user) {
          await db
            .collection(collectionName)
            .updateOne({ _id: { $eq: item._id } }, { $set: { primaryTechnicalLeadId: placeholderUserId } });

          count += 1;
        }
      }

      if (item.secondaryTechnicalLeadId) {
        const user = await db.collection('User').findOne({ _id: { $eq: item.secondaryTechnicalLeadId } });
        if (!user) {
          await db
            .collection(collectionName)
            .updateOne({ _id: { $eq: item._id } }, { $set: { secondaryTechnicalLeadId: placeholderUserId } });

          count += 1;
        }
      }
    }
  }

  await check('PrivateCloudProject');
  await check('PrivateCloudRequestedProject');
  await check('PublicCloudProject');
  await check('PublicCloudRequestedProject');

  console.log('create_missing_users:', count);
};

export const down = async (db, client) => {
  await db.collection('User').deleteOne({ email: 'placeholder.app@gov.bc.ca' });
};
