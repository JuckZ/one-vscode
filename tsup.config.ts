import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/extension.ts',
  ],
  format: ['cjs'],
  shims: false,
  dts: false,
  external: [
    'vscode',
  ],
  noExternal: [
    'read-pkg-up',
    'marked',
    'ftp',
    'resolve',
    'sort-package-json',
  ],
})
