import * as vscode from 'vscode'

import { Resource, FavoritesProvider } from '../provider/FavoritesProvider'
import configMgr from '../helper/configMgr'
import { DEFAULT_GROUP } from '../enum'
import { getFirstGitRepository, getGitBranchName } from '../helper/util'

export function addNewGroup(favoritesProvider: FavoritesProvider) {
  return vscode.commands.registerCommand('favorites.group.newGroup', async function (value: Resource) {
    const isGitUsed = !!getFirstGitRepository()

    let branchName: string = 'no_git_master'
    if (isGitUsed) {
      branchName = getGitBranchName()
    }

    const previousGroups = Array.from(
      new Set(((configMgr.get('groups') as string[]) || []).concat([DEFAULT_GROUP]))
    )

    vscode.window
      .showQuickPick(
        ['Input new group name'].concat(!isGitUsed ? [] : ['Create group with current branch name'])
      )
      .then((label) => {
        if (label == 'Input new group name') {
          vscode.window.showInputBox({ title: 'Input a name for new group' }).then((input) => {
            if (input) {
              addNewGroupInConfig(input, previousGroups)
            }
          })
        } else if (label == 'Create group with current branch name') {
          addNewGroupInConfig(branchName, previousGroups)
        }
      })
  })
}

function addNewGroupInConfig(name: string, previousGroups: Array<string>) {
  if (previousGroups.indexOf(name) === -1) {
    configMgr.save('groups', previousGroups.concat([name]))
    configMgr.save('currentGroup', name)
  } else {
    vscode.window.showErrorMessage(`The group "${name}" already exists.`)
  }
}
