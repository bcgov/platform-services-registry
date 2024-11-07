export const up = async (db, client) => {
  const result = await db
    .collection('PublicCloudRequest')
    .updateMany({ 'changes.membersChanged': { $exists: false } }, [{ $set: { 'changes.membersChanged': false } }]);

  console.log('add_field_membersChanged:', result);
};

export const down = async (db, client) => {};
