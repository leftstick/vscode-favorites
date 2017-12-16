import * as vscode from 'vscode'

export function isMultiRoots(): boolean {
  return (
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 1
  )
}
