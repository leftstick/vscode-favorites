import * as vscode from 'vscode'

import { Resource, FavoritesProvider } from '../provider/FavoritesProvider'
import configMgr from '../helper/configMgr'
import { getFirstGitRepository, getGitBranchName } from '../helper/util'
import { DEFAULT_GROUP } from '../enum'

export function changeGroup(favoritesProvider: FavoritesProvider) {
  return vscode.commands.registerCommand('favorites.group.changeGroup', async function (value: Resource) {
    const isGitUsed = !!getFirstGitRepository()

    let branchName: string = 'no_git_master'
    if (isGitUsed) {
      const gitBranchName = getGitBranchName()
      branchName = gitBranchName || branchName
    }
    const currentGroup = ((await configMgr.get('currentGroup')) as string) || DEFAULT_GROUP
    const groups = Array.from(
      new Set((((await configMgr.get('groups')) as string[]) || []).concat([DEFAULT_GROUP])),
    )

    let doesCurrentBranchNameGroupExist: boolean = false
    let isInCurrentBranchGroup: boolean = false
    if (isGitUsed) {
      doesCurrentBranchNameGroupExist = groups.indexOf(branchName) !== -1
      isInCurrentBranchGroup = currentGroup === branchName
    }
    vscode.window
      .showQuickPick(
        isGitUsed && doesCurrentBranchNameGroupExist && !isInCurrentBranchGroup
          ? ['Switch to current branch group'].concat(
              groups.filter((item) => item !== branchName && item !== currentGroup),
            )
          : groups.filter((item) => item !== branchName && item !== currentGroup),
        { title: 'Choose a group you want to switch to' },
      )
      .then(async (selectedCommand) => {
        if (selectedCommand === 'Switch to current branch group') {
          await configMgr.save('currentGroup', branchName)
        } else if (selectedCommand != undefined) {
          await configMgr.save('currentGroup', selectedCommand)
        }
      })
  })
}
