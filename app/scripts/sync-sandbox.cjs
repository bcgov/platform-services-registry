/* eslint-env node */
/* eslint-disable no-undef */

const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..', '..');

function copy(srcRel, dstRel) {
  const src = path.join(repoRoot, srcRel);
  const dst = path.join(repoRoot, 'app', dstRel);

  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  console.log(`[sync-sandbox] ${src} -> ${dst}`);
}

copy('sandbox/mock-users.json', 'sandbox/mock-users.json');
copy('sandbox/types.ts', 'sandbox/types.ts');

const reactEmailDir = path.join(repoRoot, 'app', '.react-email');
if (fs.existsSync(reactEmailDir)) {
  copy('sandbox/mock-users.json', '.react-email/sandbox/mock-users.json');
  copy('sandbox/types.ts', '.react-email/sandbox/types.ts');
}
