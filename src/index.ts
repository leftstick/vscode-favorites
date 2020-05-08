// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { FavoritesProvider } from './provider/FavoritesProvider'
import configMgr from './helper/configMgr'

import {
  addToFavorites,
  deleteFavorite,
  moveUp,
  moveDown,
  moveToTop,
  moveToBottom,
  toggleSort,
  revealInFinder,
  revealInSiderbar,
} from './command'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "favorites" is now active!')

  configMgr.onConfigChange(() => {
    favoritesProvider.refresh()
  })

  const favoritesProvider = new FavoritesProvider()

  vscode.window.registerTreeDataProvider('favorites', favoritesProvider)

  vscode.workspace.onDidChangeConfiguration(
    () => {
      favoritesProvider.refresh()
    },
    this,
    context.subscriptions
  )

  context.subscriptions.push(addToFavorites())
  context.subscriptions.push(deleteFavorite())
  context.subscriptions.push(revealInFinder())
  context.subscriptions.push(revealInSiderbar())
  context.subscriptions.push(moveUp(favoritesProvider))
  context.subscriptions.push(moveDown(favoritesProvider))
  context.subscriptions.push(moveToTop(favoritesProvider))
  context.subscriptions.push(moveToBottom(favoritesProvider))
  context.subscriptions.push(toggleSort(favoritesProvider))
}

// this method is called when your extension is deactivated
export function deactivate() {}
