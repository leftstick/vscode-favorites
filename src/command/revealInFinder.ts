import * as vscode from 'vscode'

import { Resource, FavoritesProvider } from '../provider/FavoritesProvider'

export function revealInFinder() {
  return vscode.commands.registerCommand('favorites.revealInFinder', async function (value: Resource) {
    if (!value && !vscode.window.activeTextEditor) {
      return vscode.window.showWarningMessage('You have to choose a resource first')
    }
    await vscode.commands.executeCommand('revealFileInOS', value.uri)
  })
}
