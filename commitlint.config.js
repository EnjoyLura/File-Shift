module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'ci', 'revert'],
    ],
    'scope-enum': [
      1,
      'always',
      [
        'auth',
        'user',
        'file',
        'conversion',
        'credit',
        'payment',
        'admin',
        'web',
        'server',
        'worker',
        'infra',
      ],
    ],
    'subject-max-length': [2, 'always', 72],
  },
};
