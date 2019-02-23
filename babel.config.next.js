module.exports = {
  presets: ['next/babel'],
  plugins: [
    [
      'emotion',
      {
        autoLabel: true,
        labelFormat: '[filename]--[local]',
        sourceMap: true,
      },
    ],
    // [
    //   'module-resolver',
    //   {
    //     alias: {
    //       root: '.',
    //     },
    //   },
    // ],
  ],
  env: {
    test: {
      presets: [
        [
          'next/babel',
          {
            'preset-env': {
              modules: 'commonjs',
            },
          },
        ],
      ],
    },
  },
};
