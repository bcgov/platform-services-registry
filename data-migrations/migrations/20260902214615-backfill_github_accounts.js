export const up = async (db, client) => {
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      const User = db.collection('User');
      const GitHubAccount = db.collection('GitHubAccount');

      const users = await User.find(
        {
          githubUsername: {
            $type: 'string',
            $ne: '',
          },
          githubAccountId: {
            $type: 'string',
            $ne: '',
          },
        },
        {
          projection: {
            _id: 1,
            githubUsername: 1,
            githubAccountId: 1,
          },
          session,
        },
      ).toArray();

      if (users.length === 0) {
        console.log('backfill_github_accounts: No legacy GitHub accounts found.');
        return;
      }

      const result = await GitHubAccount.bulkWrite(
        users.map((user) => ({
          updateOne: {
            filter: {
              userId: user._id,
            },
            update: {
              $set: {
                username: user.githubUsername.toLowerCase(),
                accountId: user.githubAccountId,
              },
            },
            upsert: true,
          },
        })),
        {
          ordered: false,
          session,
        },
      );

      console.log(
        `backfill_github_accounts: Processed ${users.length} users, created ${result.upsertedCount} and updated ${result.modifiedCount} GitHub accounts.`,
      );
    });
  } catch (error) {
    console.error('An error occurred while backfilling GitHub accounts:', error);
    throw error;
  } finally {
    await session.endSession();
  }
};

export const down = async (db, client) => {
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      const User = db.collection('User');
      const GitHubAccount = db.collection('GitHubAccount');

      const accounts = await GitHubAccount.find(
        {},
        {
          projection: {
            userId: 1,
            username: 1,
            accountId: 1,
          },
          session,
        },
      ).toArray();

      if (accounts.length > 0) {
        await User.bulkWrite(
          accounts.map((account) => ({
            updateOne: {
              filter: {
                _id: account.userId,
              },
              update: {
                $set: {
                  githubUsername: account.username,
                  githubAccountId: account.accountId,
                },
              },
            },
          })),
          {
            ordered: false,
            session,
          },
        );
      }

      const result = await GitHubAccount.deleteMany({}, { session });

      console.log(
        `backfill_github_accounts: Restored ${accounts.length} users and deleted ${result.deletedCount} GitHub accounts.`,
      );
    });
  } catch (error) {
    console.error('An error occurred while reverting the GitHub account backfill:', error);
    throw error;
  } finally {
    await session.endSession();
  }
};
