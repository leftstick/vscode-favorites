import * as vscode from 'vscode'
import * as path from 'path'

import { isMultiRoots, getSingleRootPath } from './util'
import { ItemInSettingsJson } from '../model'

class ConfigMgr {
  eventEmitter: vscode.EventEmitter<void> = new vscode.EventEmitter<void>()

  async get(key: string): Promise<Array<ItemInSettingsJson | string> | string | undefined> {
    const config = vscode.workspace.getConfiguration('favorites')
    const useSeparate = <boolean>config.get('saveSeparated')

    if (isMultiRoots() || !useSeparate) {
      return <Array<ItemInSettingsJson>>config.get(key)
    }

    return this.readFromSeparateFile(key)
  }

  async save(key: string, value: any): Promise<void> {
    const config = vscode.workspace.getConfiguration('favorites')
    const useSeparate = <boolean>config.get('saveSeparated')

    if (isMultiRoots() || !useSeparate) {
      await config.update(key, value, false)
      this.eventEmitter.fire()
      return
    }

    await this.writeToSeparateFile(key, value)
    this.eventEmitter.fire()
  }

  private async readFromSeparateFile(key: string): Promise<any> {
    try {
      const filePath = path.resolve(getSingleRootPath(), '.vscfavoriterc')
      const uri = vscode.Uri.file(filePath)
      const content = await vscode.workspace.fs.readFile(uri)
      const config = JSON.parse(content.toString())
      return config[key]
    } catch (error) {
      return undefined
    }
  }

  private async writeToSeparateFile(key: string, value: any): Promise<void> {
    try {
      const filePath = path.resolve(getSingleRootPath(), '.vscfavoriterc')
      const uri = vscode.Uri.file(filePath)

      let config: any = {}
      try {
        const content = await vscode.workspace.fs.readFile(uri)
        config = JSON.parse(content.toString())
      } catch (error) {
        // File doesn't exist or is invalid, create a new one
      }

      config[key] = value
      const content = Buffer.from(JSON.stringify(config, null, 2))
      await vscode.workspace.fs.writeFile(uri, content)
    } catch (error) {
      console.error('Error writing to .vscfavoriterc:', error)
      throw error
    }
  }

  get onConfigChange(): vscode.Event<void> {
    return this.eventEmitter.event
  }
}

export default new ConfigMgr()
