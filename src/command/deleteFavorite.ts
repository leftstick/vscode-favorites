import * as vscode from 'vscode'

import { Resource } from '../provider/FavoritesProvider'
import configMgr from '../helper/configMgr'
import { pathResolve } from '../helper/util'

export function deleteFavorite() {
  return vscode.commands.registerCommand('favorites.deleteFavorite', (value?: Resource | vscode.Uri) => {
    if (!value && !vscode.window.activeTextEditor) {
      return vscode.window.showWarningMessage('You have to choose a resource first')
    }

    const previousResources = configMgr.get('resources')

    const fsPath = value
      ? (<Resource>value).value || (<vscode.Uri>value).fsPath
      : vscode.window.activeTextEditor.document.uri.fsPath

    configMgr
      .save(
        'resources',
        previousResources.filter(r => {
          if (r !== fsPath && pathResolve(r) !== fsPath) {
            return true
          }
          return false
        })
      )
      .catch(console.warn)
  })
}
