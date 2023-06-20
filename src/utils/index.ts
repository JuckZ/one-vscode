import { workspace } from 'vscode'

// TODO 似乎没啥用
export function isInWorkspace() {
  return workspace.workspaceFolders !== undefined
}
