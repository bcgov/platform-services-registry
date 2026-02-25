export const up = async (db, client) => {
  const sessions = db.collection('UserSession');

  const cursor = sessions.find({ idirGuid: { $exists: false } }).project({ _id: 1, idToken: 1 });

  const decodePayload = (jwt) => {
    const payloadB64 = jwt.split('.')[1];
    const b64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(b64, 'base64').toString('utf8');
    return JSON.parse(json);
  };

  let updatedFromUser = 0;
  let updatedFallback = 0;
  let unresolved = 0;

  while (await cursor.hasNext()) {
    const s = await cursor.next();
    const idToken = String(s?.idToken || '');

    let email = null;
    try {
      const p = decodePayload(idToken);
      email = p.email || p.preferred_username || null;
      if (typeof email === 'string') email = email.toLowerCase();
    } catch {
      email = null;
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

    if (idirGuid) {
      await sessions.updateOne({ _id: s._id }, { $set: { idirGuid } });
      updatedFromUser++;
    } else {
      unresolved++;
      await sessions.updateOne({ _id: s._id }, { $set: { idirGuid: `session-${s._id.toString()}` } });
      updatedFallback++;
    }
  }

  console.log(`UserSession updated from User by email: ${updatedFromUser}`);
  console.log(`UserSession fallback-set (session-<id>): ${updatedFallback}`);
  console.log(`UserSession unresolved (before fallback): ${unresolved}`);
};

export const down = async (db, client) => {};
