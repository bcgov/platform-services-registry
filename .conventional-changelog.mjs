export default {
  options: {
    preset: {
      name: 'conventionalcommits',
      types: [
        {
          type: 'feat',
          section: 'Features',
        },
        {
          type: 'fix',
          scope: 'deps',
          hidden: true,
        },
        {
          type: 'fix',
          section: 'Bug Fixes',
        },
        {
          type: 'docs',
          section: 'Docs',
        },
        {
          type: 'refactor',
          section: 'Refactors',
        },
        {
          type: 'e2e',
          section: 'End-to-end Testing',
        },
        {
          type: 'chore',
          hidden: true,
        },
        {
          type: 'style',
          hidden: true,
        },
        {
          type: 'perf',
          hidden: true,
        },
        {
          type: 'test',
          hidden: true,
        },
      ],
    },
  },
};
