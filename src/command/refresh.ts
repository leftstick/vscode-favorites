import * as vscode from 'vscode'

import { Resource, FavoritesProvider } from '../provider/FavoritesProvider'

export function refresh(favoritesProvider: FavoritesProvider) {
  return vscode.commands.registerCommand('favorites.nav.refresh', async function () {
    favoritesProvider.refresh()
  })
}
