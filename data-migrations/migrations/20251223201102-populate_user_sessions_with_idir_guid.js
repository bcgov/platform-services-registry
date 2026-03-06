export const up = async (db, client) => {
  const sessions = db.collection('UserSession');
  const users = db.collection('User');
  const missingIdirGuidFilter = { $or: [{ idirGuid: { $exists: false } }, { idirGuid: null }] };

  // delete stale sessions
  const result = await sessions.deleteMany({
    roles: { $size: 0 },
    teams: { $size: 0 },
    ...missingIdirGuidFilter,
  });

  console.log(`Deleted ${result.deletedCount} stale UserSession documents`);
  const cursor = sessions.find(missingIdirGuidFilter).project({ _id: 1, idToken: 1 });

  const decodeJwtPayload = (jwt) => {
    const parts = String(jwt || '').split('.');
    const payloadB64 = parts[1];
    if (!payloadB64) throw new Error('JWT payload missing');

    let b64 = payloadB64.replaceAll('-', '+').replaceAll('_', '/');

    // restore padding if needed
    const pad = (4 - (b64.length % 4)) % 4;
    b64 += '='.repeat(pad);

    const json = Buffer.from(b64, 'base64').toString('utf8');
    return JSON.parse(json);
  };

  const getEmailFromIdToken = (idToken) => {
    if (!idToken) return null;

    try {
      const p = decodeJwtPayload(idToken);
      const raw = p?.email || p?.preferred_username;
      if (typeof raw !== 'string') return null;
      return raw.toLowerCase();
    } catch {
      return null;
    }
  };

  const resolveIdirGuidByEmail = async (email) => {
    if (!email) return null;

    const user = await users.findOne({ email }, { projection: { idirGuid: 1, archived: 1 } });

    if (!user?.idirGuid) return null;
    if (user.archived !== true) return user.idirGuid;

    // If archived, prefer an active record (same email) when present
    const active = await users.findOne({ email, archived: false }, { projection: { idirGuid: 1 } });

    return active?.idirGuid || user.idirGuid;
  };

  let updatedFromUser = 0;
  let unresolved = 0;

  while (await cursor.hasNext()) {
    const s = await cursor.next();
    const email = getEmailFromIdToken(String(s?.idToken || ''));

    const idirGuid = await resolveIdirGuidByEmail(email);

    if (!idirGuid) {
      unresolved++;
      throw new Error(`Unable to resolve idirGuid for UserSession ${s._id} (email=${email ?? 'null'})`);
    }

    await sessions.updateOne({ _id: s._id }, { $set: { idirGuid } });
    updatedFromUser++;
  }

  console.log(`UserSession updated from User by email: ${updatedFromUser}`);
  console.log(`UserSession unresolved: ${unresolved}`);
};

export const down = async (db, client) => {};
