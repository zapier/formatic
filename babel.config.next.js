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
