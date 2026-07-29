import { defineConfig } from 'eslint/config';

const nodeGlobals = {
    require: 'readonly',
    module: 'writable',
    exports: 'writable',
    __dirname: 'readonly',
    __filename: 'readonly',
    process: 'readonly',
    console: 'readonly',
    Buffer: 'readonly',
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
    setInterval: 'readonly',
    clearInterval: 'readonly',
};

const mochaGlobals = {
    suite: 'readonly',
    test: 'readonly',
    describe: 'readonly',
    it: 'readonly',
    before: 'readonly',
    after: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly',
};

export default defineConfig([
    {
        ignores: ['node_modules/**', '.vscode-test/**'],
    },
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals: nodeGlobals,
        },
        rules: {
            'no-const-assign': 'warn',
            'no-this-before-super': 'warn',
            'no-undef': 'warn',
            'no-unreachable': 'warn',
            'no-unused-vars': 'warn',
            'constructor-super': 'warn',
            'valid-typeof': 'warn',
        },
    },
    {
        files: ['test/**/*.js'],
        languageOptions: {
            globals: {
                ...nodeGlobals,
                ...mochaGlobals,
            },
        },
    },
]);
