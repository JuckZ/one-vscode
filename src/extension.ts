/* eslint-disable no-console */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { getMarkdownAsHtml } from './render/markdownRender'
import { DepNodeProvider } from './nodeDependencies'
import type { FtpModel } from './ftpExplorer'
import { FtpTreeDataProvider } from './ftpExplorer'
import { activate as openInGitHubActivate } from './open-in-github/extension'
import { activate as whereAmIActivate } from './where-am-i/extension'

let currentPanel: vscode.WebviewPanel | undefined

function commentLine() {
  vscode.commands.executeCommand('editor.action.addCommentLine')
}

class CommentHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    const commentCommandUri = vscode.Uri.parse('command:editor.action.addCommentLine')
    const contents = new vscode.MarkdownString(`[Add comment](${commentCommandUri})`)

    // command URIs如果想在Markdown 内容中生效, 你必须设置`isTrusted`。
    // 当创建可信的Markdown 字符, 请合理地清理所有的输入内容
    // 以便你期望的命令command URIs生效
    contents.isTrusted = true

    return new vscode.Hover(contents)
  }
}

class GitStageHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    const args = [{ resourceUri: document.uri }]
    const commentCommandUri = vscode.Uri.parse(`command:git.stage?${encodeURIComponent(JSON.stringify(args))}`)
    const contents = new vscode.MarkdownString(`[Stage file](${commentCommandUri})`)
    contents.isTrusted = true
    return new vscode.Hover(contents)
  }
}

async function printDefinitionsForActiveEditor() {
  const activeEditor = vscode.window.activeTextEditor
  if (!activeEditor)
    return

  const definitions = await vscode.commands.executeCommand<vscode.Location[]>(
    'vscode.executeDefinitionProvider',
    activeEditor.document.uri,
    activeEditor.selection.active
  )

  for (const definition of definitions)
    console.log(definition)
}

function refreshPanel() {
  const html = getMarkdownAsHtml()
  currentPanel!.webview.html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Markdown Preview</title>
</head>
<body>
<div id="app">
${JSON.stringify(html)}
</div>
</body>
</html>
`
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "one-vscode" is now active!')

  whereAmIActivate(context)
  openInGitHubActivate()
  return
  const helloWorldDisposable = vscode.commands.registerCommand('one-vscode.helloWorld', () => {
    const msg = vscode.l10n.t('Hello {0}!', 'World')
    vscode.window.showInformationMessage(msg)
  })

  const commentLineDisposable = vscode.commands.registerCommand('one-vscode.commentLine', () => {
    commentLine()
  })

  const printDefinitionsForActiveEditorDisposable = vscode.commands.registerCommand('one-vscode.printDefinitionsForActiveEditor', () => {
    printDefinitionsForActiveEditor()
  })

  currentPanel = vscode.window.createWebviewPanel(
    'markdownPreview', // viewType
    'One VSCode Markdown', // 视图标题
    vscode.ViewColumn.One, // 显示在编辑器的哪个部位
    {
      enableScripts: true, // 启用JS，默认禁用
      retainContextWhenHidden: true, // webview被隐藏时保持状态，避免被重置
    }
  )

  currentPanel.onDidDispose(() => {
    currentPanel = undefined
  }, undefined, context.subscriptions)

  vscode.languages.registerHoverProvider('markdown', new CommentHoverProvider())
  vscode.languages.registerHoverProvider('markdown', new GitStageHoverProvider())

  vscode.window.registerTreeDataProvider('nodeDependencies', new DepNodeProvider(undefined))

  // 如果你想在视图中通过编程手段创建一些操作，你就不能再注册window.registerTreeDataProvider了，而是window.createTreeView，这样一来你就有权限提供你喜欢的视图操作了：
  vscode.window.createTreeView('ftpExplorer', {
    treeDataProvider: new FtpTreeDataProvider(undefined as unknown as FtpModel),
  })

  context.subscriptions.push(helloWorldDisposable)
  context.subscriptions.push(commentLineDisposable)
  context.subscriptions.push(printDefinitionsForActiveEditorDisposable)

  // Handle the message inside the webview
  window.addEventListener('message', (event: Event) => {
    refreshPanel()
  })
}

vscode.workspace.onDidChangeTextDocument((event) => {
  if (event.document === vscode.window.activeTextEditor?.document) {
    const html = getMarkdownAsHtml()
    console.warn('onDidChangeTextDocument', html)
    refreshPanel()
    currentPanel!.webview.postMessage({ html })
  }
})

// window.addEventListener('message', event => {
//   this.html = event.data.html;
// });

// This method is called when your extension is deactivated
export function deactivate() {
  // currentPanel.dispose();
  // remove all listeners
}
