import * as vscode from 'vscode'

import { Resource, FavoritesProvider } from '../provider/FavoritesProvider'
import configMgr from '../helper/configMgr'
import { getCurrentResources, replaceArrayElements } from '../helper/util'

export function moveDown(favoritesProvider: FavoritesProvider) {
  return vscode.commands.registerCommand('favorites.moveDown', async function (value: Resource) {
    try {
      const config = vscode.workspace.getConfiguration('favorites')
      const currentGroup = await configMgr.get('currentGroup') as string

      const items = await getCurrentResources()
      const filteredArray: {
        filePath: string
        group: string
        previousIndex: number
      }[] = []

      items.forEach((item, index) => {
        if (item.group === currentGroup) {
          filteredArray.push({ filePath: item.filePath, group: item.group, previousIndex: index })
        }
      })

      const currentItem = filteredArray.find((i) => i.filePath === value.value)
      if (!currentItem) {
        return
      }

      const currentIndex = currentItem.previousIndex
      const targetIndexOfFiltered = filteredArray.findIndex((i) => i.filePath === value.value)

      if (currentIndex === filteredArray[filteredArray.length - 1].previousIndex) {
        return
      }

      const nextIndex = filteredArray[targetIndexOfFiltered + 1].previousIndex

      let resources = replaceArrayElements(items, currentIndex, nextIndex)

      await config.update('sortOrder', 'MANUAL', false)
      await configMgr.save('resources', resources)
    } catch (error) {
      console.error('Error moving down:', error)
      vscode.window.showErrorMessage('Failed to move resource down')
    }
  })
}
