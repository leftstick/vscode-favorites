import * as vscode from 'vscode'
import configMgr from '../helper/configMgr'

export class GroupCommandProvider implements vscode.Disposable {
  private disposables: vscode.Disposable[] = []
  private isUpdating = false

  constructor() {
    // Register command dynamic provider
    this.updateGroupCommands()

    // Listen for group changes
    configMgr.onConfigChange(() => {
      this.updateGroupCommands()
    })
  }

  private async updateGroupCommands() {
    // Prevent concurrent updates
    if (this.isUpdating) {
      return
    }

    try {
      this.isUpdating = true

      // Clear existing disposables
      this.disposables.forEach((d) => d.dispose())
      this.disposables = []

      // Get current groups
      const value = await configMgr.get('groups')
      const groups = Array.isArray(value) ? value.filter((item: any) => typeof item === 'string') : []

      if (groups && groups.length > 0) {
        for (const group of groups) {
          try {
            // Register command for each group
            const disposable = vscode.commands.registerCommand(
              `favorites.addToFavorites.${group}`,
              async (fileUri?: vscode.Uri) => {
                try {
                  if (!fileUri) {
                    if (!vscode.window.activeTextEditor) {
                      return vscode.window.showWarningMessage('You have to choose a resource first')
                    }
                    fileUri = vscode.window.activeTextEditor.document.uri
                  }

                  // Import here to avoid circular dependencies
                  const {
                    isMultiRoots,
                    getSingleRootPath,
                    getCurrentResources,
                    hasRoot,
                  } = require('../helper/util')

                  const fileName = fileUri.fsPath
                  const previousResources = await getCurrentResources()

                  // Store the stringified uri for any resource that isn't a file
                  const rootPath = getSingleRootPath()
                  const newResource =
                    fileUri.scheme !== 'file'
                      ? fileUri.toString()
                      : isMultiRoots() ||
                          !hasRoot() ||
                          !fileName.toLowerCase().startsWith(rootPath.toLowerCase())
                        ? fileName
                        : rootPath.endsWith('/') || rootPath.endsWith('\\')
                          ? fileName.substr(rootPath.length)
                          : fileName.substr(rootPath.length + 1)

                  // Check if the resource is already in the group
                  if (previousResources.some((r: any) => r.filePath === newResource && r.group === group)) {
                    return
                  }

                  // Add to favorites with the selected group
                  await configMgr.save(
                    'resources',
                    previousResources.concat([{ filePath: newResource, group }]),
                  )

                  // Switch current group to the selected group
                  await configMgr.save('currentGroup', group)

                  // Refresh the favorites view
                  await vscode.commands.executeCommand('favorites.nav.refresh')
                } catch (error) {
                  console.error('Error adding to favorites:', error)
                  vscode.window.showErrorMessage('Failed to add resource to favorites')
                }
              },
            )

            this.disposables.push(disposable)
          } catch (error) {
            // Command already exists, skip
            console.log(`Command favorites.addToFavorites.${group} already exists, skipping`)
          }
        }
      }
    } catch (error) {
      console.error('Error updating group commands:', error)
    } finally {
      this.isUpdating = false
    }
  }

  dispose() {
    this.disposables.forEach((d) => d.dispose())
  }
}
