import * as vscode from 'vscode'

import { Resource, FavoritesProvider } from '../provider/FavoritesProvider'
import configMgr from '../helper/configMgr'

export function changeGroup(favoritesProvider: FavoritesProvider) {
  return vscode.commands.registerCommand('favorites.group.changeGroup', async function (value: Resource) {
    vscode.window
      .showQuickPick((configMgr.get('groups') as string[]).map((item)=>({label:item})),{title:'Choose a group you want to switch to'})
      .then((selectedCommand) => {
        configMgr.save('currentGroup',selectedCommand.label);
      })
  })
}
