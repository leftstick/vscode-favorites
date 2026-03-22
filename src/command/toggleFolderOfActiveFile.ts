import * as vscode from 'vscode'
import * as path from 'path'
import configMgr from '../helper/configMgr'
import { getCurrentResources, isMultiRoots, getSingleRootPath, hasRoot } from '../helper/util'
import { DEFAULT_GROUP } from '../enum'

export function toggleFolderOfActiveFile() {
  return vscode.commands.registerCommand('favorites.toggleFolderOfActiveFile', async () => {
    try {
      // Get active editor
      const editor = vscode.window.activeTextEditor
      if (!editor) {
        vscode.window.showInformationMessage('No active editor found')
        return
      }

      const resourceUri = editor.document.uri
      const fileName = resourceUri.fsPath
      const folderPath = path.dirname(fileName)

      // Store the stringified uri for any resource that isn't a file
      const rootPath = getSingleRootPath()
      const normalizedFolderPath =
        resourceUri.scheme !== 'file'
          ? resourceUri.toString()
          : isMultiRoots() || !hasRoot() || !folderPath.toLowerCase().startsWith(rootPath.toLowerCase())
            ? folderPath
            : rootPath.endsWith('/') || rootPath.endsWith('\\')
              ? folderPath.substr(rootPath.length)
              : folderPath.substr(rootPath.length + 1)

      // Get current resources
      const resources = await getCurrentResources()
      const resourceIndex = resources.findIndex((r) => r.filePath === normalizedFolderPath)

      if (resourceIndex >= 0) {
        // Remove from favorites
        resources.splice(resourceIndex, 1)
        await configMgr.save('resources', resources)
        vscode.window.showInformationMessage('Removed folder from favorites')
      } else {
        // Add to favorites
        const currentGroup = ((await configMgr.get('currentGroup')) as string) || DEFAULT_GROUP
        resources.push({ filePath: normalizedFolderPath, group: currentGroup })
        await configMgr.save('resources', resources)
        vscode.window.showInformationMessage('Added folder to favorites')
      }

      // Refresh favorites view
      await vscode.commands.executeCommand('favorites.nav.refresh')
    } catch (error) {
      console.error('Error toggling folder favorite:', error)
      vscode.window.showErrorMessage('Failed to toggle folder favorite status')
    }
  })
}
