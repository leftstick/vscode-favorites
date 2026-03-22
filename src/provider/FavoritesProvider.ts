import * as vscode from 'vscode'
import * as path from 'path'
import * as os from 'os'

import { getCurrentResources, isMultiRoots, pathResolve, resolveResourcePath } from '../helper/util'
import configMgr from '../helper/configMgr'
import { DEFAULT_GROUP, FileStat } from '../enum'
import { Item, ItemInSettingsJson } from '../model'

export class FavoritesProvider implements vscode.TreeDataProvider<Resource> {
  private _onDidChangeTreeData = new vscode.EventEmitter<Resource | void>()
  readonly onDidChangeTreeData: vscode.Event<Resource | void> = this._onDidChangeTreeData.event

  // Use for detecting doubleclick
  public lastOpened: { uri: vscode.Uri; date: Date } | undefined

  refresh(element?: Resource): void {
    if (element) {
      // Incremental update, only update the specified element
      this._onDidChangeTreeData.fire(element)
    } else {
      // Full update, update the entire tree
      this._onDidChangeTreeData.fire()
    }
  }

  getTreeItem(element: Resource): vscode.TreeItem {
    return element
  }

  getChildren(element?: Resource): Thenable<Resource[]> {
    return this.getSortedFavoriteResources().then(async (resources) => {
      if (!resources || !resources.length) {
        return []
      }
      const currentGroup = ((await configMgr.get('currentGroup')) as string) || DEFAULT_GROUP

      if (!element) {
        return Promise.all(resources.map((r) => this.getResourceStat(r)))
          .then((data: Array<Item>) => {
            return data.filter((i) => i.stat !== FileStat.NEITHER)
          })
          .then((data: Array<Item>) => {
            return data.filter((i) => i.group === currentGroup)
          })
          .then((data: Array<Item>) => this.data2Resource(data, 'resource'))
      }

      return this.getChildrenResources({ filePath: element.value, group: currentGroup })
    })
  }

  private getChildrenResources(item: ItemInSettingsJson): Thenable<Array<Resource>> {
    const sort = <string>vscode.workspace.getConfiguration('favorites').get('sortOrder')

    let uri: vscode.Uri
    if (item.filePath.match(/^[A-Za-z][A-Za-z0-9+-.]*:/)) {
      // filePath is a uri string
      uri = vscode.Uri.parse(item.filePath)
    } else {
      // Not a uri string
      uri = vscode.Uri.file(pathResolve(item.filePath))
    }

    return vscode.workspace.fs
      .readDirectory(uri)
      .then((entries) =>
        this.sortResources(
          entries.map((e) => {
            const entryUri = vscode.Uri.joinPath(uri, e[0])
            return { filePath: entryUri.fsPath, group: '' }
          }),
          sort === 'MANUAL' ? 'ASC' : sort,
        ),
      )
      .then((items) => this.data2Resource(items, 'resourceChild'))
      .then(
        (result) => result,
        () => {
          return []
        },
      )
  }

  private async getSortedFavoriteResources(): Promise<Array<ItemInSettingsJson>> {
    const resources = await getCurrentResources()
    const sort = <string>vscode.workspace.getConfiguration('favorites').get('sortOrder')

    if (sort === 'MANUAL') {
      return resources
    }

    return this.sortResources(
      resources.map((item) => item),
      sort,
    ).then((res) => res.map((r) => ({ filePath: r.filePath, group: r.group })))
  }

  private sortResources(resources: Array<ItemInSettingsJson>, sort: string): Thenable<Array<Item>> {
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

  private getResourceStat(item: ItemInSettingsJson): Thenable<Item> {
    return new Promise((resolve) => {
      let uri: vscode.Uri
      // Check if it's an absolute path
      if (path.isAbsolute(item.filePath)) {
        // It's an absolute path, treat as file path
        const resolvedPath = resolveResourcePath(item.filePath)
        uri = vscode.Uri.file(resolvedPath)
      } else if (item.filePath.match(/^[A-Za-z][A-Za-z0-9+-.]*:/)) {
        // filePath is a uri string
        uri = vscode.Uri.parse(item.filePath)
      } else {
        // filePath is a relative file path
        const resolvedPath = resolveResourcePath(item.filePath)
        uri = vscode.Uri.file(resolvedPath)
      }

      vscode.workspace.fs.stat(uri).then(
        (fileStat) => {
          if (fileStat.type === vscode.FileType.File) {
            return resolve({
              filePath: item.filePath,
              stat: FileStat.FILE,
              uri,
              group: item.group,
            })
          }
          if (fileStat.type === vscode.FileType.Directory) {
            return resolve({
              filePath: item.filePath,
              stat: FileStat.DIRECTORY,
              uri,
              group: item.group,
            })
          }
          return resolve({
            filePath: item.filePath,
            stat: FileStat.NEITHER,
            uri,
            group: item.group,
          })
        },
        (error) => {
          // For external files, try to check if they exist using Node.js fs
          try {
            const fs = require('fs')
            const fsPath = uri.fsPath
            if (fs.existsSync(fsPath)) {
              const stats = fs.statSync(fsPath)
              if (stats.isFile()) {
                return resolve({
                  filePath: item.filePath,
                  stat: FileStat.FILE,
                  uri,
                  group: item.group,
                })
              }
              if (stats.isDirectory()) {
                return resolve({
                  filePath: item.filePath,
                  stat: FileStat.DIRECTORY,
                  uri,
                  group: item.group,
                })
              }
            }
          } catch (e) {
            // Ignore errors
          }
          return resolve({
            filePath: item.filePath,
            stat: FileStat.NEITHER,
            group: item.group,
          })
        },
      )
    })
  }

  private data2Resource(data: Array<Item>, contextValue: string): Array<Resource> {
    const enablePreview = <boolean>vscode.workspace.getConfiguration('workbench.editor').get('enablePreview')

    // contextValue set on Resource gets a 'uri.' prefix if the favorite is specified as a uri,
    //   and a '.dir' suffix if it represents a directory rather than a file.
    // The when-clauses on our contributions to the 'view/item/context' menu use these modifiers
    //   to be smarter about which commands to offer.

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
            contextValue + '.dir',
            undefined,
            uri,
          )
        }

        return new Resource(
          path.basename(i.filePath),
          vscode.TreeItemCollapsibleState.None,
          i.filePath,
          contextValue,
          {
            command: 'favorites.open',
            title: '',
            arguments: [uri],
          },
          uri,
        )
      } else {
        if (i.stat === FileStat.DIRECTORY) {
          return new Resource(
            path.basename(i.filePath),
            vscode.TreeItemCollapsibleState.Collapsed,
            i.filePath,
            'uri.' + contextValue + '.dir',
            undefined,
            i.uri,
          )
        }
        return new Resource(
          path.basename(i.filePath),
          vscode.TreeItemCollapsibleState.None,
          i.filePath,
          'uri.' + contextValue,
          {
            command: 'favorites.open',
            title: '',
            arguments: [i.uri],
          },
          i.uri,
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
    public uri?: vscode.Uri,
  ) {
    super(label, collapsibleState)

    this.resourceUri = uri ? uri : vscode.Uri.file(value)
    this.tooltip = value
  }
}
