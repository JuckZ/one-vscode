import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { getMarkdownAsHtml } from '../render/markdownRender'

describe('markdownRender', () => {
  it('exported', () => {
    // 读取文件内容
    const filePath = path.join(__dirname, './test.md')
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const html = getMarkdownAsHtml(fileContent)
    const result = `
<!DOCTYPE html>
<html>
  <head>
  <meta charset="UTF-8">
  <title>Markdown Preview</title>
  </head>
  <body>
    <div id="app">
    ${html}
    </div>
  </body>
</html>
`
    const htmlPath = path.join(__dirname, './test.html')
    fs.writeFileSync(htmlPath, result)
    expect(1).toEqual(1)
  })
})
