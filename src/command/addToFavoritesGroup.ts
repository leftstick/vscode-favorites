import * as vscode from 'vscode'
import { isMultiRoots, getSingleRootPath, getCurrentResources, hasRoot } from '../helper/util'
import configMgr from '../helper/configMgr'
import { DEFAULT_GROUP } from '../enum'
import { ItemInSettingsJson } from '../model'

export function addToFavoritesGroup() {
  return vscode.commands.registerCommand('favorites.addToFavoritesGroup', async (fileUri?: vscode.Uri) => {
    try {
      if (!fileUri) {
        if (!vscode.window.activeTextEditor) {
          return vscode.window.showWarningMessage('You have to choose a resource first')
        }
        fileUri = vscode.window.activeTextEditor.document.uri
      }

      // Get current groups
      const groups = (await configMgr.get('groups')) as string[]
      if (!groups || groups.length === 0) {
        return vscode.window.showErrorMessage('No groups found')
      }

      // Show quick pick to select group
      const selectedGroup = await vscode.window.showQuickPick(groups, {
        placeHolder: 'Select a group to add to',
      })

      if (!selectedGroup) {
        return // User canceled
      }

      const fileName = fileUri.fsPath
      const previousResources = await getCurrentResources()

      // Store the stringified uri for any resource that isn't a file
      const rootPath = getSingleRootPath()
      const newResource =
        fileUri.scheme !== 'file'
          ? fileUri.toString()
          : isMultiRoots() || !hasRoot() || !fileName.toLowerCase().startsWith(rootPath.toLowerCase())
            ? fileName
            : rootPath.endsWith('/') || rootPath.endsWith('\\')
              ? fileName.substr(rootPath.length)
              : fileName.substr(rootPath.length + 1)

      // Check if the resource is already in the group
      if (previousResources.some((r) => r.filePath === newResource && r.group === selectedGroup)) {
        return vscode.window.showInformationMessage('Resource already in this group')
      }

      // Add to favorites with the selected group
      await configMgr.save(
        'resources',
        previousResources.concat([
          { filePath: newResource, group: selectedGroup },
        ] as Array<ItemInSettingsJson>),
      )

      // Switch current group to the selected group
      await configMgr.save('currentGroup', selectedGroup)

      // Refresh the favorites view
      await vscode.commands.executeCommand('favorites.nav.refresh')
      vscode.window.showInformationMessage(`Added to group: ${selectedGroup}`)
    } catch (error) {
      console.error('Error adding to favorites:', error)
      vscode.window.showErrorMessage('Failed to add resource to favorites')
    }
  })
}
