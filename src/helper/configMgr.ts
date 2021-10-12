import * as vscode from 'vscode'
import * as nconf from 'nconf'
import * as path from 'path'

import { isMultiRoots, getSingleRootPath } from './util'
import { ItemInSettingsJson } from '../model'

class ConfigMgr {
  eventEmitter: vscode.EventEmitter<void> = new vscode.EventEmitter<void>()

  get(key): Array<ItemInSettingsJson>|string {
    const config = vscode.workspace.getConfiguration('favorites')
    const useSeparate = <boolean>config.get('saveSeparated')

    if (isMultiRoots() || !useSeparate) {
      return <Array<ItemInSettingsJson>>config.get(key)
    }

    nconf.file({ file: path.resolve(getSingleRootPath(), '.vscfavoriterc') })

    return nconf.get(key) || []
  }

  save(key: string, value: any): Promise<void> {
    const config = vscode.workspace.getConfiguration('favorites')
    const useSeparate = <boolean>config.get('saveSeparated')

    if (isMultiRoots() || !useSeparate) {
      config.update(key, value, false)
      return Promise.resolve()
    }

    nconf.file({ file: path.resolve(getSingleRootPath(), '.vscfavoriterc') })

    nconf.set(key, value)

    return new Promise<void>((resolve, reject) => {
      nconf.save(err => {
        if (err) {
          return reject(err)
        }
        this.eventEmitter.fire()
        resolve()
      })
    })
  }

  get onConfigChange(): vscode.Event<void> {
    return this.eventEmitter.event
  }
}

export default new ConfigMgr()
