import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

import { FileStat } from '../enum';
import { Item } from '../model';

export class FavoritesProvider implements vscode.TreeDataProvider<Resource> {


    private _onDidChangeTreeData: vscode.EventEmitter<Resource | undefined> = new vscode.EventEmitter<Resource | undefined>();
    readonly onDidChangeTreeData: vscode.Event<Resource | undefined> = this._onDidChangeTreeData.event;

    constructor(private workspaceRoot: string) {
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: Resource): vscode.TreeItem {
        return element;
    }

    getChildren(element?: Resource): Thenable<Resource[]> {

        const resources = this.getFavoriteResources();
        if (!resources || !resources.length) {
            return Promise.resolve([]);
        }

        if (!element) {
            return Promise
                .all(resources.map(r => this.getResourceStat(r)))
                .then((data: Array<Item>) => {
                    return data.filter(i => i.stat !== FileStat.NEITHER);
                })
                .then((data: Array<Item>) => this.data2Resource(data, 'resource'));
        }

        return this.getChildrenResources(element.value);
    }

    private getChildrenResources(filePath: string): Thenable<Array<Resource>> {

        return new Promise<Array<Resource>>((resolve, reject) => {
            fs.readdir(path.resolve(this.workspaceRoot, filePath), (err, files) => {
                if (err) {
                    return resolve([]);
                }

                Promise
                    .all(files.map(f => this.getResourceStat(path.join(filePath, f))))
                    .then((data: Array<Item>) => this.data2Resource(data, 'resourceChild'))
                    .then(resolve);
            });
        });
    }

    private getFavoriteResources(): Array<string> {
        const resources = <Array<string>>vscode.workspace.getConfiguration('favorites').get('resources');
        const sort = <string>vscode.workspace.getConfiguration('favorites').get('sortOrder');

        if (sort !== 'MANUAL') {
            const isAsc = sort === 'ASC';
            resources.sort(function (a, b) {
                const aName = path.basename(a);
                const bName = path.basename(b);
                if (aName < bName) {
                    return isAsc ? -1 : 1;
                }
                return aName === bName ? 0 : (isAsc ? 1 : -1);
            });
        }
        return resources;
    }

    private getResourceStat(filePath: string): Thenable<Item> {
        return new Promise(resolve => {
            fs.stat(path.resolve(this.workspaceRoot, filePath), (err, stat: fs.Stats) => {
                if (err) {
                    return resolve({
                        filePath,
                        stat: FileStat.NEITHER
                    });
                }
                if (stat.isDirectory()) {
                    return resolve({
                        filePath,
                        stat: FileStat.DIRECTORY
                    });
                }
                if (stat.isFile()) {
                    return resolve({
                        filePath,
                        stat: FileStat.FILE
                    });
                }
                return resolve({
                    filePath,
                    stat: FileStat.NEITHER
                });
            });
        });
    }

    private data2Resource(data: Array<Item>, contextValue: string): Array<Resource> {
        return data.map(i => {
            if (i.stat === FileStat.DIRECTORY) {
                return new Resource(path.basename(i.filePath), vscode.TreeItemCollapsibleState.Collapsed, i.filePath, contextValue);
            }
            let uri = vscode.Uri.parse(`file://${path.resolve(this.workspaceRoot, i.filePath)}`);
            if (os.platform().startsWith('win')) {
                uri = vscode.Uri.parse(`file:///${path.resolve(this.workspaceRoot, i.filePath)}`.replace(/\\/g, '/'))
            }
            return new Resource(path.basename(i.filePath), vscode.TreeItemCollapsibleState.None, i.filePath, contextValue, {
                command: 'vscode.open',
                title: '',
                arguments: [uri],
            });
        });
    }
}

export class Resource extends vscode.TreeItem {

    constructor(public label: string, public collapsibleState: vscode.TreeItemCollapsibleState, public value: string, public contextValue: string, public command?: vscode.Command) {
        super(label, collapsibleState);
    }

}