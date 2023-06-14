// https://github.com/unional/vscode-sort-package-json
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, it } from 'vitest'
import { getSortFn } from '../../sort-package-json/getSortFn'

it('gets the bundled sort-package-json', () => {
  const pkgJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'))
  const result = getSortFn(pkgJson, __filename)
  expect(typeof result).toBe('function')
})
