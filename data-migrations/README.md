# Data Migrations

It uses [`migrate-mongo`](https://github.com/seppevs/migrate-mongo) for data migration while `prisma` uses for database schema migration.

## CLI Usage

```
$ npx migrate-mongo
Usage: migrate-mongo [options] [command]


  Commands:

    init                  initialize a new migration project
    create [description]  create a new database migration with the provided description
    up [options]          run all unapplied database migrations
    down [options]        undo the last applied database migration
    status [options]      print the changelog of the database

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```

## Basic Usage

### Creating a new migration script

To create a new database migration script, just run the `npx migrate-mongo create [description]` command.

For example:

```bash
$ npx migrate-mongo create blacklist_the_beatles
Created: migrations/20160608155948-blacklist_the_beatles.js
```

A new migration file is created in the `migrations` directory:

```javascript
export const up = async (db, client) => {
  // TODO write your migration here.
  // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
  // Example:
  // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
};

export const down = async (db, client) => {
  // TODO write the statements to rollback your migration (if possible)
  // Example:
  // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
};
```

Edit this content so it actually performs changes to your database. Don't forget to write the down part as well.
The `db` object contains [the official MongoDB db object](https://www.npmjs.com/package/mongodb)
The `client` object is a [MongoClient](https://mongodb.github.io/node-mongodb-native/3.3/api/MongoClient.html) instance (which you can omit if you don't use it).

There are 3 options to implement the `up` and `down` functions of your migration:

1. Return a Promises
2. Use async-await
3. Call a callback (DEPRECATED!)

Always make sure the implementation matches the function signature:

- `function up(db, client) { /* */ }` should return `Promise`
- `async function up(db, client) { /* */ }` should contain `await` keyword(s) and return `Promise`
- `function up(db, client, next) { /* */ }` should callback `next`

#### Example 1: Return a Promise

```javascript
export const up = async (db, client) => {
  return db.collection('albums').updateOne({ artist: 'The Beatles' }, { $set: { blacklisted: true } });
};

export const down = async (db, client) => {
  return db.collection('albums').updateOne({ artist: 'The Beatles' }, { $set: { blacklisted: false } });
};
```

#### Example 2: Use async & await

Async & await is especially useful if you want to perform multiple operations against your MongoDB in one migration.

```javascript
export const up = async (db, client) => {
  await db.collection('albums').updateOne({ artist: 'The Beatles' }, { $set: { blacklisted: true } });
  await db.collection('albums').updateOne({ artist: 'The Doors' }, { $set: { stars: 5 } });
};

export const down = async (db, client) => {
  await db.collection('albums').updateOne({ artist: 'The Doors' }, { $set: { stars: 0 } });
  await db.collection('albums').updateOne({ artist: 'The Beatles' }, { $set: { blacklisted: false } });
};
```

#### Overriding the sample migration

To override the content of the sample migration that will be created by the `create` command,
create a file **`sample-migration.js`** in the migrations directory.

### Checking the status of the migrations

At any time, you can check which migrations are applied (or not)

```bash
$ npx migrate-mongo status
┌─────────────────────────────────────────┬────────────┐
│ Filename                                │ Applied At │
├─────────────────────────────────────────┼────────────┤
│ 20160608155948-blacklist_the_beatles.js │ PENDING    │
└─────────────────────────────────────────┴────────────┘

```

### Migrate up

This command will apply all pending migrations

```bash
$ npx migrate-mongo up
MIGRATED UP: 20160608155948-blacklist_the_beatles.js
```

If an an error occurred, it will stop and won't continue with the rest of the pending migrations

If we check the status again, we can see the last migration was successfully applied:

```bash
$ npx migrate-mongo status
┌─────────────────────────────────────────┬──────────────────────────┐
│ Filename                                │ Applied At               │
├─────────────────────────────────────────┼──────────────────────────┤
│ 20160608155948-blacklist_the_beatles.js │ 2016-06-08T20:13:30.415Z │
└─────────────────────────────────────────┴──────────────────────────┘
```

### Migrate down

With this command, migrate-mongo will revert (only) the last applied migration

```bash
$ npx migrate-mongo down
MIGRATED DOWN: 20160608155948-blacklist_the_beatles.js
```

If we check the status again, we see that the reverted migration is pending again:

```bash
$ npx migrate-mongo status
┌─────────────────────────────────────────┬────────────┐
│ Filename                                │ Applied At │
├─────────────────────────────────────────┼────────────┤
│ 20160608155948-blacklist_the_beatles.js │ PENDING    │
└─────────────────────────────────────────┴────────────┘
```

## Advanced Features

### Using a custom config file

All actions (except `init`) accept an optional `-f` or `--file` option to specify a path to a custom config file.
By default, migrate-mongo will look for a `migrate-mongo-config.js` config file in of the current directory.

#### Example:

```bash
$ npx migrate-mongo status -f '~/configs/albums-migrations.js'
┌─────────────────────────────────────────┬────────────┐
│ Filename                                │ Applied At │
├─────────────────────────────────────────┼────────────┤
│ 20160608155948-blacklist_the_beatles.js │ PENDING    │
└─────────────────────────────────────────┴────────────┘

```

### Using MongoDB's Transactions API

You can make use of the [MongoDB Transaction API](https://docs.mongodb.com/manual/core/transactions/) in your migration scripts.

Note: this requires both:

- MongoDB 4.0 or higher
- migrate-mongo 7.0.0 or higher

migrate-mongo will call your migration `up` and `down` function with a second argument: `client`.
This `client` argument is an [MongoClient](https://mongodb.github.io/node-mongodb-native/3.3/api/MongoClient.html) instance, it gives you access to the `startSession` function.

Example:

```javascript
export const up = async (db, client) => {
  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      await db.collection('albums').updateOne({ artist: 'The Beatles' }, { $set: { blacklisted: true } }, { session });
      await db.collection('albums').updateOne({ artist: 'The Doors' }, { $set: { stars: 5 } }, { session });
    });
  } finally {
    await session.endSession();
  }
};

export const down = async (db, client) => {
  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      await db.collection('albums').updateOne({ artist: 'The Beatles' }, { $set: { blacklisted: false } }, { session });
      await db.collection('albums').updateOne({ artist: 'The Doors' }, { $set: { stars: 0 } }, { session });
    });
  } finally {
    await session.endSession();
  }
};
```

### Version

To know which version of migrate-mongo you're running, just pass the `version` option:

```bash
$ npx migrate-mongo version
```
