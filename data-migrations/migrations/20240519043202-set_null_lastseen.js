export const up = async (db, client) => {
  const userProm = db.collection('User').updateMany({}, [{ $set: { lastSeen: null } }]);

  const result = await Promise.all([userProm]);

  console.log('set_null_lastseen:', result);
};

export const down = async (db, client) => {};
