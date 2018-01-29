import * as vscode from 'vscode'

import { Resource } from '../provider/FavoritesProvider'
import configMgr from '../helper/configMgr'

export function deleteFavorite() {
  return vscode.commands.registerCommand('favorites.deleteFavorite', (value: Resource) => {
    const previousResources = configMgr.get('resources')

    configMgr.save('resources', previousResources.filter(r => r !== value.value)).catch(console.warn)
  })
}
