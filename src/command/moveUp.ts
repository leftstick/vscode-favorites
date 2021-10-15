import * as vscode from 'vscode'

import { Resource, FavoritesProvider } from '../provider/FavoritesProvider'
import configMgr from '../helper/configMgr'
import { getCurrentResources, replaceArrayElements } from '../helper/util'

export function moveUp(favoritesProvider: FavoritesProvider) {
  return vscode.commands.registerCommand('favorites.moveUp', async function(value: Resource) {
    const config = vscode.workspace.getConfiguration('favorites')
    const currentGroup = configMgr.get('currentGroup') as string

    const items = await getCurrentResources()
    const filteredArray: {
      filePath: string
      group: string
      previousIndex: number
    }[] = []

    items.forEach((value, index) => {
      if (value.group == currentGroup) {
        filteredArray.push({ filePath: value.filePath, group: value.group, previousIndex: index })
      }
    })

    const currentIndex = filteredArray.find((i) => i.filePath === value.value).previousIndex
    const targetIndexOfFiltered = filteredArray.findIndex((i) => i.filePath === value.value)

    if (currentIndex === filteredArray[0].previousIndex) {
      return
    }else{
      var previousIndex = filteredArray[targetIndexOfFiltered-1].previousIndex
    }

    let resources = replaceArrayElements(items, currentIndex, previousIndex)

    config.update('sortOrder', 'MANUAL', false)
    configMgr.save('resources', resources).catch(console.warn)
  })
}
