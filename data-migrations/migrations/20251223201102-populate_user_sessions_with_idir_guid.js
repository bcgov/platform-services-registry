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
    if (parts.length !== 3) {
      throw new Error('Invalid JWT structure');
    }
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
    if (!idToken) {
      console.warn(`UserSession ${sessionId}: missing idToken`);
      return null;
    }

    try {
      const p = decodeJwtPayload(idToken);
      const raw = p?.email || p?.preferred_username;
      if (typeof raw !== 'string' || !raw.trim()) {
        console.warn(`UserSession ${sessionId}: no email/preferred_username in token payload`);
        return null;
      }
      return raw.toLowerCase();
    } catch (error) {
      console.warn(`UserSession ${sessionId}: failed to decode idToken (${error.message})`);
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
      console.warn(`UserSession ${s._id}: unable to resolve idirGuid (email=${email ?? 'null'})`);
      continue;
    }

    await sessions.updateOne({ _id: s._id }, { $set: { idirGuid } });
    updatedFromUser++;
    console.log(`UserSession ${s._id}: idirGuid populated from User record (email=${email})`);
  }

  console.log(`UserSession updated from User by email: ${updatedFromUser}`);
  console.log(`UserSession unresolved: ${unresolved}`);
};

export const down = async (db, client) => {};
