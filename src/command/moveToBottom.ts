import * as vscode from 'vscode'

import { Resource, FavoritesProvider } from '../provider/FavoritesProvider'
import configMgr from '../helper/configMgr'
import { getCurrentResources } from '../helper/util'

export function moveToBottom(favoritesProvider: FavoritesProvider) {
  return vscode.commands.registerCommand('favorites.moveToBottom', async function (value: Resource) {
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

    if (currentIndex === filteredArray[filteredArray.length - 1].previousIndex) {
      return
    }

    items.push(items[currentIndex])
    items.splice(currentIndex, 1)

    config.update('sortOrder', 'MANUAL', false)
    configMgr.save('resources', items).catch(console.warn)
  })
}
