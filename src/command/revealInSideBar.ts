import * as vscode from 'vscode'

import { Resource } from '../provider/FavoritesProvider'

export function revealInSideBar() {
  return vscode.commands.registerCommand('favorites.revealInSideBar', async function (value: Resource) {
    if (!value && !vscode.window.activeTextEditor) {
      return vscode.window.showWarningMessage('You have to choose a resource first')
    }

    if (value.uri) {
      await vscode.commands.executeCommand('revealInExplorer', value.uri)
    }
  })
}
