// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { FavoritesProvider } from './provider/FavoritesProvider'
import { GroupCommandProvider } from './provider/GroupCommandProvider'
import configMgr from './helper/configMgr'
import { resolveResourcePath } from './helper/util'

import {
  addToFavorites,
  addToFavoritesGroup,
  addNewGroup,
  deleteFavorite,
  toggleFavorite,
  toggleFolderOfActiveFile,
  moveUp,
  moveDown,
  moveToTop,
  moveToBottom,
  refresh,
  toggleSort,
  changeGroup,
  revealInOS_mac,
  revealInOS_windows,
  revealInOS_other,
  revealInSideBar,
  openToSide,
  open,
} from './command'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "favorites" is now active!')

  vscode.commands.executeCommand('setContext', 'ext:allFavoriteViews', ['favorites', 'favorites-full-view'])

  const favoritesProvider = new FavoritesProvider()
  const groupCommandProvider = new GroupCommandProvider()

  configMgr.onConfigChange(() => {
    favoritesProvider.refresh()
  })

  // Add to context subscriptions
  context.subscriptions.push(groupCommandProvider)

  vscode.window.createTreeView('favorites', {
    treeDataProvider: favoritesProvider,
    showCollapseAll: true,
    dragAndDropController: favoritesProvider,
  })
  const tree = vscode.window.createTreeView('favorites-full-view', {
    treeDataProvider: favoritesProvider,
    showCollapseAll: true,
    dragAndDropController: favoritesProvider,
  })

  // Set initial group message
  configMgr.get('currentGroup').then((currentGroup) => {
    tree.message = `Current Group: ${currentGroup || 'Default'}`
  })

  vscode.workspace.onDidChangeConfiguration(
    () => {
      configMgr.get('currentGroup').then((currentGroup) => {
        tree.message = `Current Group: ${currentGroup || 'Default'}`
        favoritesProvider.refresh()
      })
    },
    undefined,
    context.subscriptions,
  )

  // Listen for file rename events to update favorites
  vscode.workspace.onDidRenameFiles(
    async (event) => {
      const resources = ((await configMgr.get('resources')) as Array<any>) || []
      let updated = false

      const updatedResources = resources.map((resource) => {
        if (typeof resource === 'string') {
          return resource
        }

        let oldPath = resolveResourcePath(resource.filePath)

        // Check if this resource was renamed
        for (const rename of event.files) {
          if (oldPath === rename.oldUri.fsPath) {
            updated = true
            // Update to new path
            if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
              return { ...resource, filePath: rename.newUri.fsPath }
            }
            const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath
            if (rename.newUri.fsPath.startsWith(rootPath)) {
              return { ...resource, filePath: rename.newUri.fsPath.substr(rootPath.length + 1) }
            } else {
              return { ...resource, filePath: rename.newUri.fsPath }
            }
          }
        }
        return resource
      })

      // Check if any renamed file is inside a favorite folder
      let folderUpdated = false
      for (const resource of resources) {
        if (typeof resource === 'object' && resource.filePath) {
          let folderPath = resolveResourcePath(resource.filePath)

          // Check if any renamed file is inside this folder
          for (const rename of event.files) {
            if (rename.oldUri.fsPath.startsWith(folderPath + require('path').sep)) {
              folderUpdated = true
              break
            }
          }

          if (folderUpdated) {
            break
          }
        }
      }

      if (updated) {
        await configMgr.save('resources', updatedResources)
        favoritesProvider.refresh()
      } else if (folderUpdated) {
        // Refresh if any file inside a favorite folder was renamed
        favoritesProvider.refresh()
      }
    },
    undefined,
    context.subscriptions,
  )

  context.subscriptions.push(addToFavorites())
  context.subscriptions.push(addToFavoritesGroup())
  context.subscriptions.push(deleteFavorite())
  context.subscriptions.push(toggleFavorite())
  context.subscriptions.push(toggleFolderOfActiveFile())
  context.subscriptions.push(revealInOS_mac())
  context.subscriptions.push(revealInOS_windows())
  context.subscriptions.push(revealInOS_other())
  context.subscriptions.push(revealInSideBar())
  context.subscriptions.push(openToSide())
  context.subscriptions.push(open(favoritesProvider))
  context.subscriptions.push(moveUp(favoritesProvider))
  context.subscriptions.push(moveDown(favoritesProvider))
  context.subscriptions.push(moveToTop(favoritesProvider))
  context.subscriptions.push(moveToBottom(favoritesProvider))
  context.subscriptions.push(refresh(favoritesProvider))
  context.subscriptions.push(toggleSort(favoritesProvider))
  context.subscriptions.push(changeGroup(favoritesProvider))
  context.subscriptions.push(addNewGroup(favoritesProvider))
}

// this method is called when your extension is deactivated
export function deactivate() {}
