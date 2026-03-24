import * as vscode from 'vscode'
import configMgr from '../helper/configMgr'

export class GroupCommandProvider implements vscode.Disposable {
  private disposables: vscode.Disposable[] = []

  constructor() {
    // Register command dynamic provider
    this.updateGroupCommands()

    // Listen for group changes
    configMgr.onConfigChange(() => {
      this.updateGroupCommands()
    })
  }

  private updateGroupCommands() {
    // Clear existing disposables
    this.disposables.forEach(d => d.dispose())
    this.disposables = []

    // Get current groups
    configMgr.get('groups').then((groups: string[]) => {
      if (groups && groups.length > 0) {
        groups.forEach(group => {
          // Register command for each group
          const disposable = vscode.commands.registerCommand(`favorites.addToFavorites.${group}`, async (fileUri?: vscode.Uri) => {
            try {
              if (!fileUri) {
                if (!vscode.window.activeTextEditor) {
                  return vscode.window.showWarningMessage('You have to choose a resource first')
                }
                fileUri = vscode.window.activeTextEditor.document.uri
              }

              // Import here to avoid circular dependencies
              const { isMultiRoots, getSingleRootPath, getCurrentResources, hasRoot } = require('../helper/util')
              const { ItemInSettingsJson } = require('../model')

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
              if (previousResources.some((r: any) => r.filePath === newResource && r.group === group)) {
                return
              }

              // Add to favorites with the selected group
              await configMgr.save(
                'resources',
                previousResources.concat([
                  { filePath: newResource, group },
                ] as Array<ItemInSettingsJson>),
              )

              // Switch current group to the selected group
              await configMgr.save('currentGroup', group)

              // Refresh the favorites view
              await vscode.commands.executeCommand('favorites.nav.refresh')
            } catch (error) {
              console.error('Error adding to favorites:', error)
              vscode.window.showErrorMessage('Failed to add resource to favorites')
            }
          })

          this.disposables.push(disposable)

          // Add to submenu
          const submenuItem = vscode.commands.registerCommand(`favorites.addToFavorites.${group}`, () => {})
          this.disposables.push(submenuItem)
        })
      }
    })
  }

  dispose() {
    this.disposables.forEach(d => d.dispose())
  }
}
