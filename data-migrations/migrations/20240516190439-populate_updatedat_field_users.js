export const up = async (db, client) => {
  const userProm = db
    .collection('User')
    .updateMany({ updatedAt: { $exists: false } }, [{ $set: { updatedAt: '$lastSeen' } }]);

  const result = await Promise.all([userProm]);

  console.log('populate_updatedat_field_users:', result);
};

export const down = async (db, client) => {};
