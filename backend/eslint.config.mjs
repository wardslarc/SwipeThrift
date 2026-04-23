import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...tseslint.configs.recommended,
  {
    // Apply project-based rules only to src files
    files: ['src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "no-console": "off"
    }
  },
  {
    // Config files don't need project-based rules
    files: ['*.mjs'],
    languageOptions: {
      parserOptions: {
        project: false,
      },
    },
  }
);
