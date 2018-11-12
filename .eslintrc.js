module.exports = {
  /**
   * ESLint: http://eslint.org/docs/user-guide/configuring
   */
  // "env:" supplies predefined global variables
  env: {
    browser: true,
    es6: true
  },
  // our configuration extends the recommended base configuration
  // as well as the recommended base config for react
  extends: ['eslint:recommended'],
  // define the type of file `script` or `module` for ES6 Modules
  parserOptions: {
    sourceType: 'script',
    ecmaFeatures: {
      modules: true
    },
    ecmaVersion: 6
  },
  //ESLint rules: Severity Levels: off = 0 | warn = 1 | error = 2
  rules: {
    eqeqeq: 'error', //prefer strict equality `===`
    'no-console': 'warn', //allows but warn about console like `console.log()`
    'no-unused-vars': 'warn', //warns about unused variables
    'no-eval': 'error', //disallows `eval()` usage
    indent: [
      2,
      2,
      {
        SwitchCase: 1
      }
    ], //enforce 2 space indents (not tabs)
    quotes: [
      'error',
      'single',
      {
        allowTemplateLiterals: true,
        avoidEscape: true
      }
    ], //prefer single quotes over double quotes
    semi: ['error', 'always'] //enforce semi-colon usage
  },
  globals: {
    chrome: false,
    rating: true,
    log: false
  }
};
