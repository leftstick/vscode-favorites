import * as vscode from 'vscode'
import { isMultiRoots, getSingleRootPath, getCurrentResources, hasRoot } from '../helper/util'
import configMgr from '../helper/configMgr'
import { DEFAULT_GROUP } from '../enum'
import { ItemInSettingsJson } from '../model'

export function addToFavorites() {
  return vscode.commands.registerCommand('favorites.addToFavorites', async (fileUri?: vscode.Uri) => {
    try {
      if (!fileUri) {
        if (!vscode.window.activeTextEditor) {
          return vscode.window.showWarningMessage('You have to choose a resource first')
        }
        fileUri = vscode.window.activeTextEditor.document.uri
      }

      const fileName = fileUri.fsPath

      const previousResources = await getCurrentResources()

      // Store the stringified uri for any resource that isn't a file
      const newResource =
        fileUri.scheme !== 'file'
          ? fileUri.toString()
          : isMultiRoots() || !hasRoot() || !fileName.startsWith(getSingleRootPath())
          ? fileName
          : fileName.substr(getSingleRootPath().length + 1)

      const currentGroup = (await configMgr.get('currentGroup') as string) || DEFAULT_GROUP

      if (previousResources.some((r) => r.filePath === newResource && r.group === currentGroup)) {
        return
      }

      await configMgr.save(
        'resources',
        previousResources.concat([
          { filePath: newResource, group: currentGroup },
        ] as Array<ItemInSettingsJson>)
      )

      const groups = await configMgr.get('groups') as string[]
      if (!groups || groups.length === 0) {
        await configMgr.save('groups', [DEFAULT_GROUP])
      }
    } catch (error) {
      console.error('Error adding to favorites:', error)
      vscode.window.showErrorMessage('Failed to add resource to favorites')
    }
  })
}
