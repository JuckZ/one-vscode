import { marked } from 'marked'

export function getMarkdownAsHtml(markdown: string) {
  // TODO 添加markdown样式 增强语法如obsidian的callout
  const html = marked(markdown, { gfm: true, breaks: true, renderer: new marked.Renderer(), tokenizer: new marked.Tokenizer() })
  return `${html}`
}
