import * as vscode from 'vscode'

import { Resource, FavoritesProvider } from '../provider/FavoritesProvider'
import configMgr from '../helper/configMgr'
import { getCurrentResources } from '../helper/util'

export function moveToTop(favoritesProvider: FavoritesProvider) {
  return vscode.commands.registerCommand('favorites.moveToTop', async function (value: Resource) {
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

    if (currentIndex === filteredArray[0].previousIndex) {
      return
    }

    items.unshift(items[currentIndex])
    items.splice(currentIndex + 1, 1)

    config.update('sortOrder', 'MANUAL', false)
    configMgr.save('resources', items).catch(console.warn)
  })
}
