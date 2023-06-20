import { StatusBarAlignment, window } from 'vscode'
import { isInWorkspace } from '../utils'

export function activate() {
  const statusBar = window.createStatusBarItem(StatusBarAlignment.Left, 0)
  statusBar.command = 'workbench.action.openWorkspaceConfigFile'
  statusBar.text = '$(window)'
  statusBar.tooltip = 'Open Workspace Config File'
  if (isInWorkspace())
    statusBar.show()
}
