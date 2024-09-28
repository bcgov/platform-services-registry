import type { UserConfig } from '@commitlint/types';

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  'scope-numeric': [
    2,
    'always',
    (parsed: any) => {
      const scope = parsed.scope;
      return scope && /^[0-9]+$/.test(scope) ? [true] : [false, 'Scope must be a number'];
    },
  ],
  allowCustomScopes: true,
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'update', 'ci', 'build'],
    ],
  },
};

export default config;
