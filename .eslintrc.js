module.exports = {
  extends: './node_modules/zapier-scripts/src/config/eslint.js',
  overrides: [
    {
      files: [
        'src/components/**/*.js',
        '**/components/mixins/**/*.js',
        'src/formatic.js',
      ],
      rules: {
        'no-restricted-syntax': [
          0,
          "ImportDeclaration[source.value='create-react-class']",
        ],
      },
    },
  ],
};
