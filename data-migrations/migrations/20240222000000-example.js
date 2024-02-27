export const up = async (db, client) => {
  // TODO write your migration here. Return a Promise (and/or use async & await).
  // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
  // Example:
  // return db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
  console.log('example up');
};

export const down = async (db, client) => {
  // TODO write the statements to rollback your migration (if possible)
  // Example:
  // return db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  console.log('example down');
};
