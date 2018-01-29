import * as vscode from 'vscode'

export function getSingleRootPath(): string {
  return vscode.workspace.workspaceFolders[0].uri.fsPath
}

export function isMultiRoots(): boolean {
  return vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 1
}
