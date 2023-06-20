/* eslint-disable no-void */
import { basename, dirname } from 'node:path'
import * as vscode from 'vscode'
import Client from 'ftp'

interface IEntry {
  name: string
  type: string
}

export interface FtpNode {

  resource: vscode.Uri
  isDirectory: boolean

}

export class FtpModel {
  constructor(readonly host: string, private user: string, private password: string) {
  }

  public connect(): Thenable<Client> {
    return new Promise((resolve, reject) => {
      const client = new Client()
      client.on('ready', () => {
        resolve(client)
      })

      client.on('error', (error: any) => {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject(`Error while connecting: ${error.message}`)
      })

      client.connect({
        host: this.host,
        user: this.user,
        password: this.password,
      })
    })
  }

  public get roots(): Thenable<FtpNode[]> {
    return this.connect().then((client) => {
      return new Promise((resolve, reject) => {
        client.list((err, list) => {
          if (err)
            return reject(err)

          client.end()

          return resolve(this.sort(list.map(entry => ({ resource: vscode.Uri.parse(`ftp://${this.host}///${entry.name}`), isDirectory: entry.type === 'd' }))))
        })
      })
    })
  }

  public getChildren(node: FtpNode): Thenable<FtpNode[]> {
    return this.connect().then((client) => {
      return new Promise((resolve, reject) => {
        client.list(node.resource.fsPath, (err, list) => {
          if (err)
            return reject(err)

          client.end()

          return resolve(this.sort(list.map(entry => ({ resource: vscode.Uri.parse(`${node.resource.fsPath}/${entry.name}`), isDirectory: entry.type === 'd' }))))
        })
      })
    })
  }

  private sort(nodes: FtpNode[]): FtpNode[] {
    return nodes.sort((n1, n2) => {
      if (n1.isDirectory && !n2.isDirectory)
        return -1

      if (!n1.isDirectory && n2.isDirectory)
        return 1

      return basename(n1.resource.fsPath).localeCompare(basename(n2.resource.fsPath))
    })
  }

  public getContent(resource: vscode.Uri): Thenable<string> {
    return this.connect().then((client) => {
      return new Promise((resolve, reject) => {
        client.get(resource.path.substr(2), (err, stream) => {
          if (err)
            return reject(err)

          let string = ''
          stream.on('data', (buffer) => {
            if (buffer) {
              const part = buffer.toString()
              string += part
            }
          })

          stream.on('end', () => {
            client.end()
            resolve(string)
          })
        })
      })
    })
  }
}

export class FtpTreeDataProvider implements vscode.TreeDataProvider<FtpNode>, vscode.TextDocumentContentProvider {
  private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>()
  readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event

  constructor(private readonly model: FtpModel) { }

  public refresh(): any {
    this._onDidChangeTreeData.fire(undefined)
  }

  public getTreeItem(element: FtpNode): vscode.TreeItem {
    return {
      resourceUri: element.resource,
      collapsibleState: element.isDirectory ? vscode.TreeItemCollapsibleState.Collapsed : void 0,
      command: element.isDirectory
        ? void 0
        : {
            command: 'ftpExplorer.openFtpResource',
            arguments: [element.resource],
            title: 'Open FTP Resource',
          },
    }
  }

  public getChildren(element?: FtpNode): FtpNode[] | Thenable<FtpNode[]> {
    return element ? this.model.getChildren(element) : this.model.roots
  }

  public getParent(element: FtpNode): FtpNode | undefined {
    const parent = element.resource.with({ path: dirname(element.resource.path) })
    return parent.path !== '//' ? { resource: parent, isDirectory: true } : undefined
  }

  public provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string> {
    return this.model.getContent(uri).then(content => content)
  }
}

export class FtpExplorer {
  private ftpViewer: vscode.TreeView<FtpNode>

  constructor(context: vscode.ExtensionContext) {
    /* Please note that login information is hardcoded only for this example purpose and recommended not to do it in general. */
    const ftpModel = new FtpModel('mirror.switch.ch', 'anonymous', 'anonymous@anonymous.de')
    const treeDataProvider = new FtpTreeDataProvider(ftpModel)
    context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider('ftp', treeDataProvider))

    // 如果你想在视图中通过编程手段创建一些操作，你就不能再注册window.registerTreeDataProvider了，而是window.createTreeView，这样一来你就有权限提供你喜欢的视图操作了：
    this.ftpViewer = vscode.window.createTreeView('ftpExplorer', { treeDataProvider })

    vscode.commands.registerCommand('ftpExplorer.refresh', () => treeDataProvider.refresh())
    vscode.commands.registerCommand('ftpExplorer.openFtpResource', resource => this.openResource(resource))
    vscode.commands.registerCommand('ftpExplorer.revealResource', () => this.reveal())
  }

  private openResource(resource: vscode.Uri): void {
    vscode.window.showTextDocument(resource)
  }

  private async reveal(): Promise<void> {
    const node = this.getNode()
    if (node)
      return this.ftpViewer.reveal(node)
  }

  private getNode(): FtpNode | undefined {
    if (vscode.window.activeTextEditor) {
      if (vscode.window.activeTextEditor.document.uri.scheme === 'ftp')
        return { resource: vscode.window.activeTextEditor.document.uri, isDirectory: false }
    }
    return undefined
  }
}