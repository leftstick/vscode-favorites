import * as vscode from 'vscode'

import { Resource, FavoritesProvider } from '../provider/FavoritesProvider'
import configMgr from '../helper/configMgr'
import { DEFAULT_GROUP } from '../enum'

export function changeGroup(favoritesProvider: FavoritesProvider) {
  return vscode.commands.registerCommand('favorites.group.changeGroup', async function (value: Resource) {
    const notUsingGit =
      vscode.extensions.getExtension('vscode.git')?.exports?.getAPI(1)._model.repositories[0] == undefined
    let branchName: string = 'no_git_master'
    if (!notUsingGit) {
      const gitExtension = vscode.extensions.getExtension('vscode.git').exports.getAPI(1)
      branchName = gitExtension._model.repositories[0]._HEAD.name
    }
    const currentGroup = (configMgr.get('currentGroup') as string) || DEFAULT_GROUP
    const groups = Array.from(new Set(((configMgr.get('groups') as string[]) || []).concat([DEFAULT_GROUP])))

    let doesCurrentBranchNameGroupExist: boolean
    let isInCurrentBranchGroup: boolean
    if (!notUsingGit) {
      doesCurrentBranchNameGroupExist = groups.indexOf(branchName) !== -1
      isInCurrentBranchGroup = currentGroup === branchName
    }
    vscode.window
      .showQuickPick(
        !notUsingGit && doesCurrentBranchNameGroupExist && !isInCurrentBranchGroup
          ? ['Switch to current branch group'].concat(
              groups.filter((item) => item !== branchName && item !== currentGroup)
            )
          : groups.filter((item) => item !== branchName && item !== currentGroup),
        { title: 'Choose a group you want to switch to' }
      )
      .then((selectedCommand) => {
        if (selectedCommand === 'Switch to current branch group') {
          configMgr.save('currentGroup', branchName)
        } else if (selectedCommand != undefined) {
          configMgr.save('currentGroup', selectedCommand)
        }
      })
  })
}
