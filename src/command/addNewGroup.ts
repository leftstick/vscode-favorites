import * as vscode from 'vscode'

import { Resource, FavoritesProvider } from '../provider/FavoritesProvider'
import configMgr from '../helper/configMgr'

export function addNewGroup(favoritesProvider: FavoritesProvider) {

  return vscode.commands.registerCommand('favorites.group.newGroup', async function (value: Resource) {
    const gitExtension = vscode.extensions.getExtension('vscode.git').exports.getAPI(1)
    const branchName:string = gitExtension._model.repositories[0]._HEAD.name
    const previousGroups = configMgr.get('groups') as Array<string>
    vscode.window
      .showQuickPick(['Input new group name', 'Create group with current branch name'])
      .then((label) => {
        if (label == 'Input new group name') {
          vscode.window.showInputBox({title:'Input a name for new group'}).then((input)=>{
            addNewGroupInConfig(input, previousGroups)
          })
        }else if(label=='Create group with current branch name'){
          addNewGroupInConfig(branchName, previousGroups)
        }
      })
  })
}

function addNewGroupInConfig(name:string,previousGroups:Array<string>){
  if(previousGroups.indexOf(name)===-1){
    configMgr.save('groups', previousGroups.concat([name]))
    configMgr.save('currentGroup',name);
  }else{
    vscode.window.showErrorMessage(`The group "${name}" already exists.`)
  }
}
