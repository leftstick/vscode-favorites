import * as vscode from 'vscode'

import { Resource, FavoritesProvider } from '../provider/FavoritesProvider'
import configMgr from '../helper/configMgr'
import { getCurrentResources } from '../helper/util'

export function moveToTop(favoritesProvider: FavoritesProvider) {
  return vscode.commands.registerCommand('favorites.moveToTop', async function (value: Resource) {
    try {
      const config = vscode.workspace.getConfiguration('favorites')
      const currentGroup = (await configMgr.get('currentGroup')) as string

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

      if (currentIndex === filteredArray[0].previousIndex) {
        return
      }

      items.unshift(items[currentIndex])
      items.splice(currentIndex + 1, 1)

      await config.update('sortOrder', 'MANUAL', false)
      await configMgr.save('resources', items)
    } catch (error) {
      console.error('Error moving to top:', error)
      vscode.window.showErrorMessage('Failed to move resource to top')
    }
  })
}
