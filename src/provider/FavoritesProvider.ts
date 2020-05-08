import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

import { isMultiRoots, pathResolve } from '../helper/util'
import configMgr from '../helper/configMgr'
import { FileStat } from '../enum'
import { Item } from '../model'

export class FavoritesProvider implements vscode.TreeDataProvider<Resource> {
  private _onDidChangeTreeData = new vscode.EventEmitter<Resource | void>()
  readonly onDidChangeTreeData: vscode.Event<Resource | void> = this._onDidChangeTreeData.event

  refresh(): void {
    this._onDidChangeTreeData.fire()
  }

  getTreeItem(element: Resource): vscode.TreeItem {
    return element
  }

  getChildren(element?: Resource): Thenable<Resource[]> {
    return this.getSortedFavoriteResources().then((resources) => {
      if (!resources || !resources.length) {
        return []
      }

      if (!element) {
        return Promise.all(resources.map((r) => this.getResourceStat(r)))
          .then((data: Array<Item>) => {
            return data.filter((i) => i.stat !== FileStat.NEITHER)
          })
          .then((data: Array<Item>) => this.data2Resource(data, 'resource'))
      }

      return this.getChildrenResources(element.value)
    })
  }

  private getChildrenResources(filePath: string): Thenable<Array<Resource>> {
    const sort = <string>vscode.workspace.getConfiguration('favorites').get('sortOrder')

    if (filePath.match(/^[A-Za-z][A-Za-z0-9+-.]*:\/\//)) {
      // filePath is a uri string
      const uri = vscode.Uri.parse(filePath)
      return vscode.workspace.fs.readDirectory(uri)
        .then((entries) => this.sortResources(
          entries.map((e) => vscode.Uri.joinPath(uri, e[0]).toString()),
          sort === 'MANUAL' ? 'ASC' : sort
        )
        )
        .then((items) => this.data2Resource(items, 'resourceChild'))
    }

    // Not a uri string
    return new Promise<Array<Resource>>((resolve, reject) => {
      fs.readdir(pathResolve(filePath), (err, files) => {
        if (err) {
          return resolve([])
        }

        this.sortResources(
          files.map((f) => path.join(filePath, f)),
          sort === 'MANUAL' ? 'ASC' : sort
        )
          .then((data) => this.data2Resource(data, 'resourceChild'))
          .then(resolve)
      })
    })
  }

  private getSortedFavoriteResources(): Thenable<Array<string>> {
    const resources = configMgr.get('resources')
    const sort = <string>vscode.workspace.getConfiguration('favorites').get('sortOrder')

    if (sort === 'MANUAL') {
      return Promise.resolve(resources)
    }

    return this.sortResources(resources, sort).then((res) => res.map((r) => r.filePath))
  }

  private sortResources(resources: Array<string>, sort: string): Thenable<Array<Item>> {
    return Promise.all(resources.map((r) => this.getResourceStat(r))).then((resourceStats) => {
      const isAsc = sort === 'ASC'
      resourceStats.sort(function (a, b) {
        const aName = path.basename(a.filePath)
        const bName = path.basename(b.filePath)
        const aStat = a.stat
        const bStat = b.stat

        if (aStat === FileStat.DIRECTORY && bStat === FileStat.FILE) {
          return -1
        }
        if (aStat === FileStat.FILE && bStat === FileStat.DIRECTORY) {
          return 1
        }

        if (aName < bName) {
          return isAsc ? -1 : 1
        }
        return aName === bName ? 0 : isAsc ? 1 : -1
      })
      return resourceStats
    })
  }

  private getResourceStat(filePath: string): Thenable<Item> {
    return new Promise((resolve) => {
      if (filePath.match(/^[A-Za-z][A-Za-z0-9+-.]*:\/\//)) {
        // filePath is a uri string
        const uri = vscode.Uri.parse(filePath)
        resolve(
          vscode.workspace.fs.stat(uri)
            .then((fileStat) => {
              if (fileStat.type === vscode.FileType.File) {
                return {
                  filePath,
                  stat: FileStat.FILE,
                  uri
                }
              }
              if (fileStat.type === vscode.FileType.Directory) {
                return {
                  filePath,
                  stat: FileStat.DIRECTORY,
                  uri
                }
              }
              return {
                filePath,
                stat: FileStat.NEITHER,
                uri
              }
            })
        )
      }
      else {
        // filePath is a file path
        fs.stat(pathResolve(filePath), (err, stat: fs.Stats) => {
          if (err) {
            return resolve({
              filePath,
              stat: FileStat.NEITHER,
            })
          }
          if (stat.isDirectory()) {
            return resolve({
              filePath,
              stat: FileStat.DIRECTORY,
            })
          }
          if (stat.isFile()) {
            return resolve({
              filePath,
              stat: FileStat.FILE,
            })
          }
          return resolve({
            filePath,
            stat: FileStat.NEITHER,
          })
        })
      }
    })
  }

  private data2Resource(data: Array<Item>, contextValue: string): Array<Resource> {
    const enablePreview = <boolean>vscode.workspace.getConfiguration('workbench.editor').get('enablePreview')

    return data.map((i) => {
      if (!i.uri) {
        let uri = vscode.Uri.parse(`file://${pathResolve(i.filePath)}`)
        if (os.platform().startsWith('win')) {
          uri = vscode.Uri.parse(`file:///${pathResolve(i.filePath)}`.replace(/\\/g, '/'))
        }
        if (i.stat === FileStat.DIRECTORY) {
          return new Resource(
            path.basename(i.filePath),
            vscode.TreeItemCollapsibleState.Collapsed,
            i.filePath,
            contextValue,
            undefined,
            uri
          )
        }

        return new Resource(
          path.basename(i.filePath),
          vscode.TreeItemCollapsibleState.None,
          i.filePath,
          contextValue,
          {
            command: 'vscode.open',
            title: '',
            arguments: [uri, { preview: enablePreview }],
          },
          uri
        )
      }
      else {
        if (i.stat === FileStat.DIRECTORY) {
          return new Resource(
            path.basename(i.filePath),
            vscode.TreeItemCollapsibleState.Collapsed,
            i.filePath,
            contextValue,
            undefined,
            i.uri
          )
        }
        return new Resource(
          path.basename(i.filePath),
          vscode.TreeItemCollapsibleState.None,
          i.filePath,
          contextValue,
          {
            command: 'vscode.open',
            title: '',
            arguments: [i.uri, { preview: enablePreview }],
          },
          i.uri
        )
      }
    })
  }
}

export class Resource extends vscode.TreeItem {
  public resourceUri: vscode.Uri

  constructor(
    public label: string,
    public collapsibleState: vscode.TreeItemCollapsibleState,
    public value: string,
    public contextValue: string,
    public command?: vscode.Command,
    public uri?: vscode.Uri
  ) {
    super(label, collapsibleState)

    this.resourceUri = (uri) ? uri : vscode.Uri.file(value)
    this.tooltip = value
  }
}
