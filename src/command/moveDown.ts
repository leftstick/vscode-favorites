import * as vscode from 'vscode'

import { Resource, FavoritesProvider } from '../provider/FavoritesProvider'
import configMgr from '../helper/configMgr'
import { getCurrentResources, replaceArrayElements } from '../helper/util'

export function moveDown(favoritesProvider: FavoritesProvider) {
  return vscode.commands.registerCommand('favorites.moveDown', async function (value: Resource) {
    const config = vscode.workspace.getConfiguration('favorites')
    const currentGroup = configMgr.get('currentGroup') as string

    const items = await getCurrentResources()
    const filteredArray: {
      filePath: string
      displayName: string
      group: string
      previousIndex: number
    }[] = []

    items.forEach((value, index) => {
      if (value.group == currentGroup) {
        filteredArray.push({
          filePath: value.filePath,
          displayName: value.displayName,
          group: value.group,
          previousIndex: index
        })
      }
    })

    const currentIndex = filteredArray.find((i) => i.filePath === value.value).previousIndex
    const targetIndexOfFiltered = filteredArray.findIndex((i) => i.filePath === value.value)

    if (currentIndex === filteredArray[filteredArray.length-1].previousIndex) {
      return
    }else{
      var nextIndex = filteredArray[targetIndexOfFiltered+1].previousIndex
    }

    let resources = replaceArrayElements(items, currentIndex, nextIndex)

    config.update('sortOrder', 'MANUAL', false)
    configMgr.save('resources', resources).catch(console.warn)
  })
}
