import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from 'eslint-plugin-import';
import jestPlugin from 'eslint-plugin-jest';
import eslintCommentsPlugin from 'eslint-plugin-eslint-comments';
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";

export default [
    // register all the plugins up-front
    {
        // note - intentionally uses computed syntax to make it easy to sort the keys
        plugins: {
            ['@typescript-eslint']: tseslint.plugin,
            ['eslint-comments']: eslintCommentsPlugin,
            ['import']: importPlugin,
            ['jest']: jestPlugin,
            // ['jsx-a11y']: jsxA11yPlugin,
            // ['react-hooks']: reactHooksPlugin,
            // ['react']: reactPlugin,
            // ['simple-import-sort']: simpleImportSortPlugin,
            // ['unicorn']: unicornPlugin,
        }
    },

    {
        // config with just ignores is the replacement for `.eslintignore`
        ignores: [
            '**/jest.config.ts',
            '**/node_modules/**',
            '**/dist/**',
            '**/fixtures/**',
            '**/coverage/**',
            '**/__snapshots__/**',
            '**/.docusaurus/**',
            '**/build/**',
            // Files copied as part of the build
            'packages/types/src/generated/**/*.ts',
            // Playground types downloaded from the web
            'packages/website/src/vendor',
            // see the file header in eslint-base.test.js for more info
            'packages/rule-tester/tests/eslint-base',
            // NextJS
            '**/next-i18next.config.js',
            '**/.next/**',
            '**/next-env.d.ts',
            '**/middleware.ts'
        ]
    },

    // extends ...
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    // ...fixupConfigRules(pluginReactConfig),
    // ...tseslint.configs.strictTypeChecked,
    // ...tseslint.configs.stylisticTypeChecked,

    // base config
    {
        languageOptions: {
            globals: {
                ...globals.es2022,
                ...globals.node,
            },
            parserOptions: {
                allowAutomaticSingleRunInference: true,
                cacheLifetime: {
                    // we pretty well never create/change tsconfig structure - so no need to ever evict the cache
                    // in the rare case that we do - just need to manually restart their IDE.
                    glob: 'Infinity',
                },
                project: [
                    'tsconfig.json',
                ],
                warnOnUnsupportedTypeScriptVersion: false,
            },
        },

        rules: {
            //
            // eslint-base
            //
            curly: ['error', 'all'],
            eqeqeq: [
                'error',
                'always',
                {
                    null: 'never',
                },
            ],
            'no-duplicate-imports': 'warn',
            'logical-assignment-operators': 'error',
            'no-else-return': 'error',
            'no-mixed-operators': 'warn',
            'no-console': 'error',
            'no-process-exit': 'error',
            'no-fallthrough': [
                'error',
                { commentPattern: '.*intentional fallthrough.*' },
            ],
            'comma-dangle': ['warn', 'never'],
            'quotes': ['warn', 'single'],
            'jsx-quotes': ['warn', 'prefer-single'],
            'max-len': [
                'warn',
                {
                    'code': 120,
                    'ignoreTemplateLiterals': true,
                    'ignoreStrings': true
                }
            ],
            'one-var': ['error', 'never'],

            //
            // typescript-eslint
            //
            '@typescript-eslint/consistent-type-imports': [
                'error',
                { prefer: 'type-imports', disallowTypeAnnotations: true },
            ],
            '@typescript-eslint/explicit-function-return-type': [
                'error',
                { allowIIFEs: true },
            ],
            '@typescript-eslint/no-explicit-any': 'error',
            'no-constant-condition': 'off',
            '@typescript-eslint/no-unnecessary-condition': [
                'error',
                { allowConstantLoopConditions: true },
            ],
            '@typescript-eslint/no-var-requires': 'off',
            '@typescript-eslint/prefer-literal-enum-member': [
                'error',
                {
                    allowBitwiseExpressions: true,
                },
            ],
            '@typescript-eslint/prefer-string-starts-ends-with': [
                'error',
                {
                    allowSingleElementEquality: 'always',
                },
            ],
            '@typescript-eslint/unbound-method': 'off',
            '@typescript-eslint/restrict-template-expressions': [
                'error',
                {
                    allowNumber: true,
                    allowBoolean: true,
                    allowAny: true,
                    allowNullish: true,
                    allowRegExp: true,
                },
            ],
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    caughtErrors: 'all',
                    varsIgnorePattern: '^_',
                    argsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/prefer-nullish-coalescing': [
                'error',
                {
                    ignoreConditionalTests: true,
                    ignorePrimitives: true,
                },
            ],

            //
            // eslint-plugin-eslint-comment
            //
            // require a eslint-enable comment for every eslint-disable comment
            'eslint-comments/disable-enable-pair': [
                'error',
                {
                    allowWholeFile: true,
                },
            ],
            // disallow a eslint-enable comment for multiple eslint-disable comments
            'eslint-comments/no-aggregating-enable': 'error',
            // disallow duplicate eslint-disable comments
            'eslint-comments/no-duplicate-disable': 'error',
            // disallow eslint-disable comments without rule names
            'eslint-comments/no-unlimited-disable': 'error',
            // disallow unused eslint-disable comments
            'eslint-comments/no-unused-disable': 'error',
            // disallow unused eslint-enable comments
            'eslint-comments/no-unused-enable': 'error',
            // disallow ESLint directive-comments
            'eslint-comments/no-use': [
                'error',
                {
                    allow: [
                        'eslint-disable',
                        'eslint-disable-line',
                        'eslint-disable-next-line',
                        'eslint-enable',
                        'global',
                    ],
                },
            ],


            //
            // eslint-plugin-import
            //
            // enforces consistent type specifier style for named imports
            'import/consistent-type-specifier-style': 'error',
            // disallow non-import statements appearing before import statements
            'import/first': 'error',
            // Forbid import of modules using absolute paths
            'import/no-absolute-path': 'error',
            // forbid default exports - we want to standardize on named exports so that imported names are consistent
            'import/no-default-export': 'error',
            // disallow imports from duplicate paths
            'import/no-duplicates': 'error',
            // Forbid the use of extraneous packages
            'import/no-extraneous-dependencies': [
                'error',
                {
                    devDependencies: true,
                    peerDependencies: true,
                    optionalDependencies: false,
                },
            ],
            // Prevent importing the default as if it were named
            'import/no-named-default': 'error',
            // Prohibit named exports
            'import/no-named-export': 'off', // we want everything to be a named export
            // Forbid a module from importing itself
            'import/no-self-import': 'error',
            // Require modules with a single export to use a default export
            'import/prefer-default-export': 'off', // we want everything to be named
        }
    },

    //
    // test file linting
    // define the jest globals for all test files
    //
    {
        files: ['packages/*/tests/**/*.{ts,tsx,cts,mts}'],
        languageOptions: {
            globals: {
                ...jestPlugin.environments.globals.globals,
            },
        },
    },
    // test file specific configuration
    {
        files: [
            '**/*.spec.{ts,tsx,cts,mts}',
            '*.test.{ts,tsx,cts,mts}',
        ],
        rules: {
            '@typescript-eslint/no-empty-function': [
                'error',
                { allow: ['arrowFunctions'] },
            ],
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            'jest/no-disabled-tests': 'error',
            'jest/no-focused-tests': 'error',
            'jest/no-alias-methods': 'error',
            'jest/no-identical-title': 'error',
            'jest/no-jasmine-globals': 'error',
            'jest/no-test-prefixes': 'error',
            'jest/no-done-callback': 'error',
            'jest/no-test-return-statement': 'error',
            'jest/prefer-to-be': 'error',
            'jest/prefer-to-contain': 'error',
            'jest/prefer-to-have-length': 'error',
            'jest/prefer-spy-on': 'error',
            'jest/valid-expect': 'error',
            'jest/no-deprecated-functions': 'error',
        },
    },
];
