import * as vscode from 'vscode'

import { Resource, FavoritesProvider } from '../provider/FavoritesProvider'
import configMgr from '../helper/configMgr'
import { getCurrentResources } from '../helper/util'

export function moveToBottom(favoritesProvider: FavoritesProvider) {
  return vscode.commands.registerCommand('favorites.moveToBottom', async function (value: Resource) {
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

      if (currentIndex === filteredArray[filteredArray.length - 1].previousIndex) {
        return
      }

      items.push(items[currentIndex])
      items.splice(currentIndex, 1)

      await config.update('sortOrder', 'MANUAL', false)
      await configMgr.save('resources', items)
    } catch (error) {
      console.error('Error moving to bottom:', error)
      vscode.window.showErrorMessage('Failed to move resource to bottom')
    }
  })
}
