import * as vscode from 'vscode'
import * as path from 'path'
import { ItemInSettingsJson } from '../model'
import configMgr from './configMgr'

export function getSingleRootPath(): string {
  return vscode.workspace.workspaceFolders[0].uri.fsPath
}

export function isMultiRoots(): boolean {
  return vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 1
}

export function hasRoot(): boolean {
  return vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
}

export function pathResolve(filePath: string) {
  if (isMultiRoots() || !hasRoot()) {
    return filePath
  }
  return path.resolve(vscode.workspace.workspaceFolders[0].uri.fsPath, filePath)
}

export function getCurrentResources(): Array<ItemInSettingsJson> {
  const resources = configMgr.get('resources') as Array<ItemInSettingsJson | string>
  const newResources: Array<ItemInSettingsJson> = resources.map((item) => {
    if (typeof item == 'string') {
      return { filePath: item, group: 'Default' } as ItemInSettingsJson
    } else {
      return item
    }
  })
  return newResources
}

export function replaceArrayElements<T>(array:Array<T>, targetId:number, sourceId:number):Array<T> {
  return array.reduce((resultArray, element, id, originalArray) => [
      ...resultArray,
      id === targetId ? originalArray[sourceId] :
      id === sourceId ? originalArray[targetId] :
      element
  ], []);
}