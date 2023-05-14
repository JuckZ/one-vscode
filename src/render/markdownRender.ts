import * as vscode from 'vscode'
import { marked } from 'marked'

export function getMarkdownAsHtml() {
  const editor = vscode.window.activeTextEditor
  if (editor) {
    const document = editor.document
    const markdown = document.getText()
    const html = marked(markdown)
    return `<h1>hello juck</h1>${html}`
  }
  return ''
}
