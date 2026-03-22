import * as vscode from 'vscode'
import configMgr from '../helper/configMgr'
import { getCurrentResources, isMultiRoots, getSingleRootPath, hasRoot } from '../helper/util'
import { DEFAULT_GROUP } from '../enum'

export function toggleFavorite() {
  return vscode.commands.registerCommand('favorites.toggleFavorite', async () => {
    try {
      // Get active editor
      const editor = vscode.window.activeTextEditor
      if (!editor) {
        vscode.window.showInformationMessage('No active editor found')
        return
      }

      const resourceUri = editor.document.uri
      const fileName = resourceUri.fsPath

      // Store the stringified uri for any resource that isn't a file
      const rootPath = getSingleRootPath()
      const resourcePath =
        resourceUri.scheme !== 'file'
          ? resourceUri.toString()
          : isMultiRoots() || !hasRoot() || !fileName.toLowerCase().startsWith(rootPath.toLowerCase())
            ? fileName
            : rootPath.endsWith('/') || rootPath.endsWith('\\')
              ? fileName.substr(rootPath.length)
              : fileName.substr(rootPath.length + 1)

      // Get current resources
      const resources = await getCurrentResources()
      const resourceIndex = resources.findIndex((r) => r.filePath === resourcePath)

      if (resourceIndex >= 0) {
        // Remove from favorites
        resources.splice(resourceIndex, 1)
        await configMgr.save('resources', resources)
        vscode.window.showInformationMessage('Removed from favorites')
      } else {
        // Add to favorites
        const currentGroup = ((await configMgr.get('currentGroup')) as string) || DEFAULT_GROUP
        resources.push({ filePath: resourcePath, group: currentGroup })
        await configMgr.save('resources', resources)
        vscode.window.showInformationMessage('Added to favorites')
      }

      // Refresh favorites view
      await vscode.commands.executeCommand('favorites.nav.refresh')
    } catch (error) {
      console.error('Error toggling favorite:', error)
      vscode.window.showErrorMessage('Failed to toggle favorite status')
    }
  })
}
