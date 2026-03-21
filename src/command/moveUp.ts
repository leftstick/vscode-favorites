import * as vscode from 'vscode'

import { Resource, FavoritesProvider } from '../provider/FavoritesProvider'
import configMgr from '../helper/configMgr'
import { getCurrentResources, replaceArrayElements } from '../helper/util'

export function moveUp(favoritesProvider: FavoritesProvider) {
  return vscode.commands.registerCommand('favorites.moveUp', async function(value: Resource) {
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

      if (currentIndex === filteredArray[0].previousIndex) {
        return
      }

      const previousIndex = filteredArray[targetIndexOfFiltered - 1].previousIndex

      let resources = replaceArrayElements(items, currentIndex, previousIndex)

      await config.update('sortOrder', 'MANUAL', false)
      await configMgr.save('resources', resources)
    } catch (error) {
      console.error('Error moving up:', error)
      vscode.window.showErrorMessage('Failed to move resource up')
    }
  })
}
