export const up = async (db, client) => {
  const sessions = db.collection('UserSession');

  const result = await sessions.deleteMany({
    roles: { $size: 0 },
    teams: { $size: 0 },
    $or: [{ idirGuid: { $exists: false } }, { idirGuid: null }],
  });

  console.log(`Deleted ${result.deletedCount} stale UserSession documents`);
  const cursor = sessions
    .find({ $or: [{ idirGuid: { $exists: false } }, { idirGuid: null }] })
    .project({ _id: 1, idToken: 1 });

  const decodePayload = (jwt) => {
    const parts = String(jwt || '').split('.');
    const payloadB64 = parts[1];
    if (!payloadB64) throw new Error('JWT payload missing');

    let b64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');

    // restore padding if needed
    const pad = (4 - (b64.length % 4)) % 4;
    b64 += '='.repeat(pad);

    const json = Buffer.from(b64, 'base64').toString('utf8');
    return JSON.parse(json);
  };
  let updatedFromUser = 0;
  let unresolved = 0;

  while (await cursor.hasNext()) {
    const s = await cursor.next();
    const idToken = String(s?.idToken || '');

    let email = null;

    if (idToken) {
      try {
        const p = decodePayload(idToken);
        email = p.email || p.preferred_username || null;
        if (typeof email === 'string') email = email.toLowerCase();
      } catch {
        email = null;
      }
    }

    let idirGuid = null;

    if (email) {
      const u = await db.collection('User').findOne({ email }, { projection: { idirGuid: 1, archived: 1 } });

      if (u?.idirGuid) {
        let chosen = u;
        if (u.archived === true) {
          const active = await db
            .collection('User')
            .findOne({ email, archived: false }, { projection: { idirGuid: 1 } });
          if (active?.idirGuid) chosen = active;
        }
        idirGuid = chosen?.idirGuid ?? null;
      }
    }

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
