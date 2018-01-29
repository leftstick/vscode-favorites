import * as vscode from 'vscode'
import { isMultiRoots, getSingleRootPath } from '../helper/util'
import configMgr from '../helper/configMgr'

export function addToFavorites() {
  return vscode.commands.registerCommand('favorites.addToFavorites', (fileUri?: vscode.Uri) => {
    if (!fileUri) {
      return vscode.window.showWarningMessage('You have to call this extension from explorer')
    }

    const fileName = fileUri.fsPath

    const previousResources = configMgr.get('resources')
    const newResource = isMultiRoots() ? fileName : fileName.substr(getSingleRootPath().length + 1)

    if (previousResources.some(r => r === newResource)) {
      return
    }

    configMgr.save('resources', previousResources.concat([newResource])).catch(console.warn)
  })
}
