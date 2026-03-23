import * as vscode from 'vscode'
import * as path from 'path'
import * as os from 'os'

import { getCurrentResources, isMultiRoots, pathResolve, resolveResourcePath } from '../helper/util'
import configMgr from '../helper/configMgr'
import { DEFAULT_GROUP, FileStat } from '../enum'
import { Item, ItemInSettingsJson } from '../model'

export class FavoritesProvider
  implements vscode.TreeDataProvider<Resource>, vscode.TreeDragAndDropController<Resource>
{
  private _onDidChangeTreeData = new vscode.EventEmitter<Resource | void>()
  readonly onDidChangeTreeData: vscode.Event<Resource | void> = this._onDidChangeTreeData.event

  // Use for detecting doubleclick
  public lastOpened: { uri: vscode.Uri; date: Date } | undefined

  // Drag and drop mime types
  readonly dragMimeTypes = ['resource']
  readonly dropMimeTypes = ['resource', 'application/vnd.code.tree.uri', 'text/uri-list', 'text/plain']

  constructor() {
    // Listen for changes to files.exclude configuration
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('files.exclude')) {
        this.refresh()
      }
    })
  }

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

  private getUriFromPath(filePath: string): vscode.Uri {
    if (filePath.match(/^[A-Za-z][A-Za-z0-9+-.]*:/)) {
      // filePath is a uri string
      return vscode.Uri.parse(filePath)
    } else {
      // filePath is a file path
      let resolvedPath: string
      if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath
        // Always resolve relative to workspace root
        resolvedPath = path.resolve(workspacePath, filePath)
      } else {
        // No workspace, use absolute path
        resolvedPath = path.resolve(filePath)
      }
      return vscode.Uri.file(resolvedPath)
    }
  }

  private getConfig<T>(section: string, key: string, defaultValue?: T): T | undefined {
    if (defaultValue !== undefined) {
      return vscode.workspace.getConfiguration(section).get<T>(key, defaultValue)
    } else {
      return vscode.workspace.getConfiguration(section).get<T>(key)
    }
  }

  private getChildrenResources(item: ItemInSettingsJson): Thenable<Array<Resource>> {
    const sort = this.getConfig<string>('favorites', 'sortOrder') || 'ASC'

    const uri = this.getUriFromPath(item.filePath)

    // Get files.exclude configuration
    const filesExclude =
      (vscode.workspace.getConfiguration('files').get('exclude') as Record<
        string,
        boolean | { when: string }
      >) || {}

    return vscode.workspace.fs
      .readDirectory(uri)
      .then((entries) => {
        // Filter out files excluded by files.exclude
        const filteredEntries = entries.filter(([name, type]) => {
          const entryPath = path.join(uri.fsPath, name)
          // Check if the file is excluded
          for (const [pattern, excludeConfig] of Object.entries(filesExclude)) {
            let shouldExclude = false

            if (typeof excludeConfig === 'boolean') {
              shouldExclude = excludeConfig
            } else if (typeof excludeConfig === 'object' && excludeConfig.when) {
              // Handle when clause
              const whenClause = excludeConfig.when
              // Simple implementation for $(basename) variable
              const basename = path.basename(entryPath, path.extname(entryPath))
              const extension = path.extname(entryPath)
              const resolvedWhenClause = whenClause.replace('$(basename)', basename)

              // For when clause, we need to check if the referenced file exists
              // e.g., "when": "$(basename).ts" means check if basename.ts exists
              const whenFilePath = path.join(path.dirname(entryPath), resolvedWhenClause)

              // Check if the referenced file exists
              try {
                const fs = require('fs')
                shouldExclude = fs.existsSync(whenFilePath)
              } catch (e) {
                shouldExclude = false
              }
            }

            if (shouldExclude && this.matchesPattern(entryPath, pattern)) {
              return false
            }
          }
          return true
        })
        const resources = filteredEntries.map((e) => {
          const entryUri = vscode.Uri.joinPath(uri, e[0])
          // Determine if the original item was a relative path
          const isOriginalRelative =
            !path.isAbsolute(item.filePath) && !item.filePath.match(/^[A-Za-z][A-Za-z0-9+-.]*:/)

          let entryPath: string
          if (
            isOriginalRelative &&
            vscode.workspace.workspaceFolders &&
            vscode.workspace.workspaceFolders.length > 0
          ) {
            const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath
            // Use relative path based on the original item's path
            if (item.filePath === '') {
              // Root of workspace
              entryPath = e[0]
            } else {
              // Relative to the original item
              entryPath = path.join(item.filePath, e[0])
            }
          } else {
            // Use absolute path
            entryPath = entryUri.fsPath
          }
          return { filePath: entryPath, group: '' }
        })
        return this.sortResources(resources, sort === 'MANUAL' ? 'ASC' : sort)
      })
      .then((items) => {
        // For resource children, we don't need to handle duplicates as they're in different directories
        return this.data2Resource(items, 'resourceChild')
      })
      .then(
        (result) => {
          return result
        },
        (error) => {
          return []
        },
      )
  }

  private matchesPattern(filePath: string, pattern: string): boolean {
    // Convert Windows path separators to forward slashes
    const normalizedFilePath = filePath.replace(/\\/g, '/')

    // Convert pattern to regex
    let regexPattern = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\?/g, '.')

    // Handle ** patterns
    regexPattern = regexPattern.replace(/\*\*\//g, '(.*/)?')
    regexPattern = regexPattern.replace(/\*\*/g, '.*')

    // For patterns that don't start with /, make them match anywhere in the path
    if (!pattern.startsWith('/')) {
      regexPattern = regexPattern.replace(/^\^/, '')
      regexPattern = '.*' + regexPattern
    }

    // Add end anchor if it doesn't have one
    if (!regexPattern.endsWith('$')) {
      regexPattern = regexPattern + '$'
    }

    const regex = new RegExp(regexPattern)
    return regex.test(normalizedFilePath)
  }

  private async getSortedFavoriteResources(): Promise<Array<ItemInSettingsJson>> {
    const resources = await getCurrentResources()
    const sort = this.getConfig<string>('favorites', 'sortOrder') || 'ASC'

    if (sort === 'MANUAL') {
      return resources
    }

    return this.sortResources(
      resources.map((item) => item),
      sort,
    ).then((res) => res.map((r) => ({ filePath: r.filePath, group: r.group })))
  }

  private compareByFileType(a: Item, b: Item): number {
    const aStat = a.stat
    const bStat = b.stat

    if (aStat === FileStat.DIRECTORY && bStat === FileStat.FILE) {
      return -1
    }
    if (aStat === FileStat.FILE && bStat === FileStat.DIRECTORY) {
      return 1
    }

    if (aStat === FileStat.DIRECTORY && bStat === FileStat.DIRECTORY) {
      const aName = path.basename(a.filePath).toLowerCase()
      const bName = path.basename(b.filePath).toLowerCase()
      return aName.localeCompare(bName)
    }

    const aExt = path.extname(a.filePath).toLowerCase()
    const bExt = path.extname(b.filePath).toLowerCase()

    if (aExt !== bExt) {
      return aExt.localeCompare(bExt)
    }

    const aName = path.basename(a.filePath).toLowerCase()
    const bName = path.basename(b.filePath).toLowerCase()
    return aName.localeCompare(bName)
  }

  private compareByName(a: Item, b: Item, isAsc: boolean): number {
    const aName = path.basename(a.filePath).toLowerCase()
    const bName = path.basename(b.filePath).toLowerCase()
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
  }

  private sortResources(resources: Array<ItemInSettingsJson>, sort: string): Thenable<Array<Item>> {
    return Promise.all(resources.map((r) => this.getResourceStat(r))).then((resourceStats) => {
      if (sort === 'FILETYPE') {
        resourceStats.sort((a, b) => this.compareByFileType(a, b))
      } else {
        const isAsc = sort === 'ASC'
        resourceStats.sort((a, b) => this.compareByName(a, b, isAsc))
      }
      return resourceStats
    })
  }

  private checkExternalFile(uri: vscode.Uri, item: ItemInSettingsJson): Item {
    try {
      const fs = require('fs')
      const fsPath = uri.fsPath
      if (fs.existsSync(fsPath)) {
        const stats = fs.statSync(fsPath)
        if (stats.isFile()) {
          return {
            filePath: item.filePath,
            stat: FileStat.FILE,
            uri,
            group: item.group,
          }
        }
        if (stats.isDirectory()) {
          return {
            filePath: item.filePath,
            stat: FileStat.DIRECTORY,
            uri,
            group: item.group,
          }
        }
      }
    } catch (e) {
      // Ignore errors
    }
    return {
      filePath: item.filePath,
      stat: FileStat.NEITHER,
      group: item.group,
    }
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
          return resolve(this.checkExternalFile(uri, item))
        },
      )
    })
  }

  private createResource(item: Item, contextValue: string, fileNameCounts?: Map<string, number>): Resource {
    const uri = item.uri || vscode.Uri.file(resolveResourcePath(item.filePath))
    const isDirectory = item.stat === FileStat.DIRECTORY
    const collapsibleState = isDirectory
      ? vscode.TreeItemCollapsibleState.Collapsed
      : vscode.TreeItemCollapsibleState.None

    let finalContextValue = contextValue
    if (item.uri) {
      finalContextValue = 'uri.' + contextValue
    }
    if (isDirectory) {
      finalContextValue += '.dir'
    }

    const command = isDirectory
      ? undefined
      : {
          command: 'favorites.open',
          title: '',
          arguments: [uri],
        }

    // Generate label with directory information for duplicate filenames
    let label = path.basename(item.filePath)
    if (!isDirectory && fileNameCounts) {
      const fileName = path.basename(item.filePath)
      if (fileNameCounts.get(fileName) && fileNameCounts.get(fileName)! > 1) {
        const dirName = path.basename(path.dirname(item.filePath))
        if (dirName && dirName !== '.') {
          label = `${dirName}/${fileName}`
        }
      }
    }

    return new Resource(label, collapsibleState, item.filePath, finalContextValue, command, uri)
  }

  private data2Resource(data: Array<Item>, contextValue: string): Array<Resource> {
    // contextValue set on Resource gets a 'uri.' prefix if the favorite is specified as a uri,
    //   and a '.dir' suffix if it represents a directory rather than a file.
    // The when-clauses on our contributions to the 'view/item/context' menu use these modifiers
    //   to be smarter about which commands to offer.

    // Count occurrences of each filename to detect duplicates
    const fileNameCounts = new Map<string, number>()
    data.forEach((item) => {
      if (item.stat === FileStat.FILE) {
        const fileName = path.basename(item.filePath)
        fileNameCounts.set(fileName, (fileNameCounts.get(fileName) || 0) + 1)
      }
    })

    return data.map((item) => this.createResource(item, contextValue, fileNameCounts))
  }

  handleDrag(
    source: readonly Resource[],
    dataTransfer: vscode.DataTransfer,
    token: vscode.CancellationToken,
  ): void {
    dataTransfer.set(
      'resource',
      new vscode.DataTransferItem(JSON.stringify(source.map((item) => item.value))),
    )
  }

  async handleDrop(
    target: Resource | undefined,
    source: vscode.DataTransfer,
    token: vscode.CancellationToken,
  ): Promise<void> {
    try {
      let sourcePaths: string[] = []

      // Check if dragging from within favorites (internal drag)
      const resourceData = source.get('resource')
      if (resourceData) {
        sourcePaths = JSON.parse(await resourceData.asString()) as string[]
      }
      // Check if dragging from editor tab or explorer (external drag)
      else {
        const uriData = source.get('application/vnd.code.tree.uri')
        if (uriData) {
          const uriString = await uriData.asString()
          const uri = vscode.Uri.parse(uriString)
          sourcePaths = [uri.fsPath]
        } else {
          // Try other common URI formats
          const textData = source.get('text/uri-list')
          if (textData) {
            const text = await textData.asString()
            const uris = text.split('\n').filter((line) => line.trim())
            sourcePaths = uris.map((uriStr) => vscode.Uri.parse(uriStr).fsPath)
          }
        }
      }

      if (!sourcePaths.length) {
        return
      }

      const currentResources = await getCurrentResources()
      const currentGroup = ((await configMgr.get('currentGroup')) as string) || DEFAULT_GROUP

      // Filter resources to only those in the current group
      const currentGroupResources = currentResources.filter((item) => item.group === currentGroup)
      const otherGroupResources = currentResources.filter((item) => item.group !== currentGroup)

      // Remove source items from current group resources (for internal drag)
      const remainingResources = currentGroupResources.filter((item) => !sourcePaths.includes(item.filePath))

      // Determine insertion point
      let insertIndex = remainingResources.length
      if (target) {
        const targetIndex = remainingResources.findIndex((item) => item.filePath === target.value)
        if (targetIndex !== -1) {
          insertIndex = targetIndex
        }
      }

      // Create new items for source paths
      const sourceItems = sourcePaths.map((filePath) => ({
        filePath,
        group: currentGroup,
      }))

      // Insert source items at the determined position
      const newResources = [
        ...remainingResources.slice(0, insertIndex),
        ...sourceItems,
        ...remainingResources.slice(insertIndex),
        ...otherGroupResources,
      ]

      // Update the configuration
      await configMgr.save('resources', newResources)
      // Set sort order to MANUAL when drag and drop occurs
      await configMgr.save('sortOrder', 'MANUAL')

      // Refresh the tree view
      this.refresh()
    } catch (error) {
      console.error('Error handling drop:', error)
    }
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
