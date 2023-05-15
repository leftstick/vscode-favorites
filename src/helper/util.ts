import * as vscode from 'vscode'
import * as path from 'path'
import { ItemInSettingsJson } from '../model'
import { DEFAULT_GROUP } from '../enum'
import configMgr from './configMgr'
import type { GitExtension, Repository, API } from '../git'

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
  const resources = (configMgr.get('resources') as Array<ItemInSettingsJson | string>) || []
  const newResources: Array<ItemInSettingsJson> = resources.map((item) => {
    if (typeof item == 'string') {
      return { filePath: item, displayName: item, group: DEFAULT_GROUP } as ItemInSettingsJson
    } else {
      return item
    }
  })
  return newResources
}

export function replaceArrayElements<T>(array: Array<T>, targetId: number, sourceId: number): Array<T> {
  return array.reduce(
    (resultArray, element, id, originalArray) => [
      ...resultArray,
      id === targetId ? originalArray[sourceId] : id === sourceId ? originalArray[targetId] : element,
    ],
    []
  )
}

export function getGitApi(): API | null {
  const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git')
  if (!gitExtension) {
    return null
  }
  if (!gitExtension.exports || !gitExtension.exports.getAPI(1)) {
    return null
  }
  return gitExtension.exports.getAPI(1)
}

export function getGitRepositories(): Repository[] | null {
  const gitApi = getGitApi()
  if (!gitApi.repositories || !gitApi.repositories.length) {
    return null
  }

  return gitApi.repositories
}

export function getFirstGitRepository(): Repository | null {
  const res = getGitRepositories()
  if (!res || !res.length) {
    return null
  }
  return res[0]
}

export function getGitBranchName(): string | null {
  const repo = getFirstGitRepository()
  if (!repo || !repo.state || !repo.state.HEAD || !repo.state.HEAD.name) {
    return null
  }
  return repo.state.HEAD.name
}
