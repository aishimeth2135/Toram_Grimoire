import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import {
  configureVueProject,
  defineConfigWithVueTs,
  vueTsConfigs,
} from '@vue/eslint-config-typescript'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import pluginVue from 'eslint-plugin-vue'
import { globalIgnores } from 'eslint/config'

configureVueProject({
  scriptLangs: ['ts', 'tsx'],
})

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
    ignores: ['src/dev', '**.config.js'],
  },

  globalIgnores([
    '**/dist/**',
    '**/dist-ssr/**',
    '**/coverage/**',
    './built',
    './src/dev/**',
    './src/assets/css/config/**',
  ]),

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  skipFormatting,
  eslintConfigPrettier,

  {
    rules: {
      'no-var': 'error',
      'eqeqeq': 'error',
      'space-in-parens': ['error', 'never'],
      'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
      'radix': ['error'],
      'id-length': ['error', { properties: 'never', exceptions: ['t'] }],

      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { caughtErrors: 'none' }],
      '@typescript-eslint/no-empty-object-type': ['warn', { allowInterfaces: 'always' }],
      '@typescript-eslint/no-use-before-define': [
        'error',
        { functions: false, classes: false, typedefs: false },
      ],
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-duplicate-enum-values': 'error',
      '@typescript-eslint/prefer-literal-enum-member': 'error',
      '@typescript-eslint/array-type': 'error',
      '@typescript-eslint/no-dupe-class-members': 'error',
      'vue/custom-event-name-casing': ['error', 'kebab-case'],
      'vue/prop-name-casing': ['error', 'camelCase'],
      'vue/attribute-hyphenation': ['error', 'always'],
      'vue/attributes-order': 'error',
      'vue/block-tag-newline': 'error',
      'vue/no-potential-component-option-typo': ['error', { presets: ['all'] }],
      'vue/padding-line-between-blocks': ['error', 'always'],
    },
  }
)
