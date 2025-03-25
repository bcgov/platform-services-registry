function removeDuplicates(arr) {
  return arr.filter((value, index, self) => self.indexOf(value) === index);
}

export const up = async (db, client) => {
  const users = await db.collection('User').find({}).toArray();

  const results = [];
  for (let x = 0; x < users.length; x++) {
    const user = users[x];

    const regex = new RegExp(user.email, 'i');
    const duplicates = await db
      .collection('User')
      .find({ email: { $regex: regex } })
      .toArray();

    if (duplicates.length > 1) {
      const ids = duplicates.map((v) => v._id);
      const otherIds = ids.filter((v) => String(v) !== String(user._id));

      const update = async (collectionName) => {
        await db
          .collection(collectionName)
          .updateMany({ projectOwnerId: { $in: otherIds } }, [{ $set: { projectOwnerId: user._id } }]);

        await db
          .collection(collectionName)
          .updateMany({ primaryTechnicalLeadId: { $in: otherIds } }, [{ $set: { primaryTechnicalLeadId: user._id } }]);

        await db
          .collection(collectionName)
          .updateMany({ secondaryTechnicalLeadId: { $in: otherIds } }, [
            { $set: { secondaryTechnicalLeadId: user._id } },
          ]);

        results.push(user.email);
      };

      await update('PrivateCloudProject');
      await update('PrivateCloudRequestedProject');
      await update('PublicCloudProject');
      await update('PublicCloudRequestedProject');

      await db.collection('User').deleteMany({ _id: { $in: otherIds } });
    }
  }

  const result = await db.collection('User').updateMany({}, [{ $set: { email: { $toLower: '$email' } } }]);
  console.log('lowercase_user_emails:', JSON.stringify(removeDuplicates(results)), result);
};

export const down = async (db, client) => {};
