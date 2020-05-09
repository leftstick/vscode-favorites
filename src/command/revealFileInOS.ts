import * as vscode from 'vscode'

import { Resource } from '../provider/FavoritesProvider'

export function revealInOS_mac() {
  return vscode.commands.registerCommand('favorites.revealInOS.mac', async function (value: Resource) {
    revealFileInOS(value)
  })
}

export function revealInOS_windows() {
  return vscode.commands.registerCommand('favorites.revealInOS.windows', async function (value: Resource) {
    revealFileInOS(value)
  })
}

export function revealInOS_other() {
  return vscode.commands.registerCommand('favorites.revealInOS.other', async function (value: Resource) {
    revealFileInOS(value)
  })
}

async function revealFileInOS(value: Resource) {
  if (!value && !vscode.window.activeTextEditor) {
    return vscode.window.showWarningMessage('You have to choose a resource first')
  }
  if (value.uri) {
    await vscode.commands.executeCommand('revealFileInOS', value.uri)
  }
}
