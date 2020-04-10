import * as vscode from 'vscode'

import { Resource, FavoritesProvider } from '../provider/FavoritesProvider'

export function revealInFinder(favoritesProvider: FavoritesProvider) {
  return vscode.commands.registerCommand('favorites.revealInFinder', async function (value: Resource) {
    console.log('this is reveal in finder')
  })
}
