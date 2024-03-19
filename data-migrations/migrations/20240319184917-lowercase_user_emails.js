export const up = async (db, client) => {
  const result = await db.collection('User').updateMany({}, [{ $set: { email: { $toLower: '$email' } } }]);

  console.log('lowercase_user_emails:', result);
};

export const down = async (db, client) => {};
