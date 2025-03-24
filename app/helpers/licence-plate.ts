import crypto from 'crypto';
import prisma from '@/core/prisma';

function generateRandomString(len = 6) {
  const gen = (requiredLength: number) =>
    crypto
      .randomBytes(Math.ceil(requiredLength / 2))
      .toString('hex')
      .slice(0, len);

  let randomStr = gen(len);
  do {
    randomStr = gen(len);
    // Number() will return a number if it is a number, will return NaN it's not a number
    // Number.isNaN // returns true if NaN, otherwise false
  } while (!Number.isNaN(+Number(randomStr.charAt(0))));
  // the reason we are doing this first Letter check is described in: https://app.zenhub.com/workspaces/platform-experience-5bb7c5ab4b5806bc2beb9d15/issues/bcgov/platform-services-registry/535
  // As discussed, this is a suitable solution in the shortterm however recommend when F5 roll out their update in early November that we remove this.
  return randomStr;
}

export default async function generateLicencePlate() {
  while (true) {
    const licencePlate = generateRandomString();
    const [cnt1, cnt2] = await Promise.all([
      prisma.privateCloudProduct.count({ where: { licencePlate } }),
      prisma.publicCloudProduct.count({ where: { licencePlate } }),
    ]);

    if (cnt1 + cnt2 === 0) return licencePlate;
  }
}
