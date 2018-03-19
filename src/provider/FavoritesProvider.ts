import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

import { isMultiRoots } from '../helper/util'
import configMgr from '../helper/configMgr'
import { FileStat } from '../enum'
import { Item } from '../model'

export class FavoritesProvider implements vscode.TreeDataProvider<Resource> {
    private _onDidChangeTreeData = new vscode.EventEmitter<Resource | undefined>()
    readonly onDidChangeTreeData: vscode.Event<Resource | undefined> = this._onDidChangeTreeData.event

    public returnEmpty: boolean = false;

    refresh(): void {
        this._onDidChangeTreeData.fire()

    }

    getTreeItem(element: Resource): vscode.TreeItem {
        return element
    }

    getChildren(element?: Resource): Thenable<Resource[]> {
        return this.getSortedFavoriteResources().then(resources => {
            if (this.returnEmpty) {
                return [];
            }


            if (!resources || !resources.length) {
                return []
            }

            if (!element) {
                return Promise.all(resources.map(r => this.getResourceStat(r)))
                    .then((data: Array<Item>) => {
                        return data.filter(i => i.stat !== FileStat.NEITHER)
                    })
                    .then((data: Array<Item>) => this.data2Resource(data, 'resource'))
            }

            return this.getChildrenResources(element.value)
        })
    }

    private getChildrenResources(filePath: string): Thenable<Array<Resource>> {
        const sort = <string>vscode.workspace.getConfiguration('favorites').get('sortOrder')

        return new Promise<Array<Resource>>((resolve, reject) => {
            fs.readdir(pathResolve(filePath), (err, files) => {
                if (err) {
                    return resolve([])
                }

                this.sortResources(files.map(f => path.join(filePath, f)), sort)
                    .then(data => this.data2Resource(data, 'resourceChild'))
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

        return this.sortResources(resources, sort).then(res => res.map(r => r.filePath))
    }

    private sortResources(resources: Array<string>, sort: string): Thenable<Array<Item>> {
        return Promise.all(resources.map(r => this.getResourceStat(r))).then(resourceStats => {
            const isAsc = sort === 'ASC'

            const dirs = resourceStats.filter((i) => i.stat === FileStat.DIRECTORY);
            const files = resourceStats.filter((i) => i.stat === FileStat.FILE);

            const dirsAZ = dirs.sort((a, b) => {
                if (a.filePath < b.filePath) return -1;
                if (a.filePath === b.filePath) return 0;
                if (a.filePath > b.filePath) return 1;
            });

            const filesAZ = files.sort((a, b) => {
                if (a.filePath < b.filePath) return -1;
                if (a.filePath === b.filePath) return 0;
                if (a.filePath > b.filePath) return 1;
            });

            if (isAsc) {
                return dirsAZ.concat(filesAZ);
            } else {
                return dirsAZ.reverse().concat(filesAZ.reverse());
            }


        })
    }

    private getResourceStat(filePath: string): Thenable<Item> {
        return new Promise(resolve => {
            fs.stat(pathResolve(filePath), (err, stat: fs.Stats) => {
                if (err) {
                    return resolve({
                        filePath,
                        stat: FileStat.NEITHER
                    })
                }
                if (stat.isDirectory()) {
                    return resolve({
                        filePath,
                        stat: FileStat.DIRECTORY
                    })
                }
                if (stat.isFile()) {
                    return resolve({
                        filePath,
                        stat: FileStat.FILE
                    })
                }
                return resolve({
                    filePath,
                    stat: FileStat.NEITHER
                })
            })
        })
    }

    private data2Resource(data: Array<Item>, contextValue: string): Array<Resource> {
        const enablePreview = <boolean>vscode.workspace.getConfiguration('workbench.editor').get('enablePreview')

        return data.map(i => {
            let uri = vscode.Uri.parse(`file://${pathResolve(i.filePath)}`)
            if (os.platform().startsWith('win')) {
                uri = vscode.Uri.parse(`file:///${pathResolve(i.filePath)}`.replace(/\\/g, '/'))
            }
            if (i.stat === FileStat.DIRECTORY) {
                return new Resource(
                    path.basename(i.filePath),
                    vscode.TreeItemCollapsibleState.Collapsed,
                    i.filePath,
                    contextValue
                )
            }

            return new Resource(
                path.basename(i.filePath),
                vscode.TreeItemCollapsibleState.Collapsed,
                i.filePath,
                contextValue,
                {
                    command: 'vscode.open',
                    title: '',
                    arguments: [uri, { preview: enablePreview }]
                }
            )
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
        public command?: vscode.Command
    ) {
        super(label, collapsibleState)

        this.resourceUri = vscode.Uri.file(value)
        this.tooltip = value
    }
}

function pathResolve(filePath: string) {
    if (isMultiRoots()) {
        return filePath
    }
    return path.resolve(vscode.workspace.workspaceFolders[0].uri.fsPath, filePath)
}
