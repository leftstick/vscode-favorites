import * as vscode from 'vscode'

import { Resource, FavoritesProvider } from '../provider/FavoritesProvider'
import configMgr from '../helper/configMgr'

export function toggleSort(favoritesProvider: FavoritesProvider) {
  return vscode.commands.registerCommand('favorites.nav.sort', async function(value: Resource) {
    const config = vscode.workspace.getConfiguration('favorites')

    const sort = <string>config.get('sortOrder')

    if (sort === 'MANUAL') {
      return
    }

    if (sort === 'ASC') {
      return config.update('sortOrder', 'DESC', false)
    }

    config.update('sortOrder', 'ASC', false)
  })
}
