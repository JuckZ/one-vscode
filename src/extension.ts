/* eslint-disable no-console */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import type { CancellationToken, ExtensionContext, HoverProvider, Location, Position, ProviderResult, TextDocument, WebviewPanel } from 'vscode'
import { Hover, MarkdownString, StatusBarAlignment, Uri, ViewColumn, commands, l10n, languages, window, workspace } from 'vscode'
import { activate as openInGitHubActivate } from './open-in-github/extension'
import { activate as whereAmIActivate } from './where-am-i/extension'
import { activate as openWorkspaceConfigFileActivate } from './edit-workspace/extension'
import { activate as sortPackageJsonActivate } from './sort-package-json/extension'
import { getMarkdownAsHtml } from './render/markdownRender'
import type { FtpModel } from './ftpExplorer'
import { FtpTreeDataProvider } from './ftpExplorer'
import { DepNodeProvider } from './nodeDependencies'

let currentPanel: WebviewPanel | undefined

function commentLine() {
  commands.executeCommand('editor.action.addCommentLine')
}

class CommentHoverProvider implements HoverProvider {
  provideHover(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): ProviderResult<Hover> {
    const commentCommandUri = Uri.parse('command:editor.action.addCommentLine')
    const contents = new MarkdownString(`[Add comment](${commentCommandUri})`)

    // command URIs如果想在Markdown 内容中生效, 你必须设置`isTrusted`。
    // 当创建可信的Markdown 字符, 请合理地清理所有的输入内容
    // 以便你期望的命令command URIs生效
    contents.isTrusted = true

    return new Hover(contents)
  }
}

class GitStageHoverProvider implements HoverProvider {
  provideHover(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): ProviderResult<Hover> {
    const args = [{ resourceUri: document.uri }]
    const commentCommandUri = Uri.parse(`command:git.stage?${encodeURIComponent(JSON.stringify(args))}`)
    const contents = new MarkdownString(`[Stage file](${commentCommandUri})`)
    contents.isTrusted = true
    return new Hover(contents)
  }
}

async function printDefinitionsForActiveEditor() {
  const activeEditor = window.activeTextEditor
  if (!activeEditor)
    return

  const definitions = await commands.executeCommand<Location[]>(
    'executeDefinitionProvider',
    activeEditor.document.uri,
    activeEditor.selection.active
  )

  for (const definition of definitions)
    console.log(definition)
}

function refreshPanel() {
  const editor = window.activeTextEditor
  if (!editor)
    return
  const document = editor.document
  const markdown = document.getText()
  const html = getMarkdownAsHtml(markdown)
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
  currentPanel!.webview.html = result
}

function createStatusBar() {
  // 创建开发者工具按钮
  const devToolsStatusBar = window.createStatusBarItem(StatusBarAlignment.Left, 0)
  devToolsStatusBar.command = 'workbench.action.toggleDevTools'
  // devToolsStatusBar.command = 'workbench.action.webview.openDeveloperTools'
  devToolsStatusBar.text = '$(tools)'
  devToolsStatusBar.tooltip = 'TimeSavior Dev'
  devToolsStatusBar.show()
  // 创建预览按钮
  const previewStatusBar = window.createStatusBarItem(StatusBarAlignment.Left, 0)
  previewStatusBar.command = 'timesavior.createPreviewPanel'
  previewStatusBar.text = '$(flame)'
  previewStatusBar.tooltip = 'TimeSavior Preview'
  previewStatusBar.show()
}

function createPreviewPanel(context: ExtensionContext) {
  const columnToShowIn = window.activeTextEditor
    ? window.activeTextEditor.viewColumn
    : undefined
  if (currentPanel && currentPanel.webview) {
    currentPanel.reveal(columnToShowIn)
  }
  else {
    currentPanel = window.createWebviewPanel(
      'markdownPreview', // viewType
      'One VSCode Markdown', // 视图标题
      ViewColumn.Beside, // 显示在编辑器的哪个部位
      {
        enableScripts: true, // 启用JS，默认禁用
        retainContextWhenHidden: true, // webview被隐藏时保持状态，避免被重置
      }
    )
    currentPanel.onDidDispose(() => {
      currentPanel = undefined
    }, undefined, context.subscriptions)
  }
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  console.log('Congratulations, your extension "timesavior" is now active!')

  whereAmIActivate(context)
  openInGitHubActivate()
  openWorkspaceConfigFileActivate()
  sortPackageJsonActivate(context)
  createStatusBar()

  const helloWorldDisposable = commands.registerCommand('timesavior.helloWorld', () => {
    const msg = l10n.t('He1llo {0}!', 'World')
    window.showInformationMessage(msg)
  })

  const commentLineDisposable = commands.registerCommand('timesavior.commentLine', () => {
    commentLine()
  })

  const createPreviewPannelDisposable = commands.registerCommand('timesavior.createPreviewPanel', () => {
    createPreviewPanel(context)
  })

  const printDefinitionsForActiveEditorDisposable = commands.registerCommand('timesavior.printDefinitionsForActiveEditor', () => {
    printDefinitionsForActiveEditor()
  })

  languages.registerHoverProvider('markdown', new CommentHoverProvider())
  languages.registerHoverProvider('markdown', new GitStageHoverProvider())
  window.registerTreeDataProvider('nodeDependencies', new DepNodeProvider(undefined))

  // 如果你想在视图中通过编程手段创建一些操作，你就不能再注册window.registerTreeDataProvider了，而是window.createTreeView，这样一来你就有权限提供你喜欢的视图操作了：
  window.createTreeView('ftpExplorer', {
    treeDataProvider: new FtpTreeDataProvider(undefined as unknown as FtpModel),
  })

  context.subscriptions.push(helloWorldDisposable)
  context.subscriptions.push(commentLineDisposable)
  context.subscriptions.push(createPreviewPannelDisposable)
  context.subscriptions.push(printDefinitionsForActiveEditorDisposable)
}

// This method is called when your extension is deactivated
export function deactivate() {
  // currentPanel.dispose();
  // remove all listeners
}

window.onDidChangeActiveTextEditor((editor) => {
  if (editor?.document.languageId !== 'markdown')
    return
  refreshPanel()
})

workspace.onDidChangeTextDocument((event) => {
  // 判断当前文件是否是markdown
  if (event.document.languageId !== 'markdown')
    return
  if (event.document === window.activeTextEditor?.document)
    refreshPanel()
    // TODO currentPanel is undefined
    // currentPanel!.webview.postMessage({ html })
})

// Handle the message inside the webview
// TODO window is undefined
// window.addEventListener('message', (event: Event) => {
//   refreshPanel()
//   // this.html = event.data.html;
// })
