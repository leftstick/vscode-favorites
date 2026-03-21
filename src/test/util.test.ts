import * as assert from 'assert'
import * as vscode from 'vscode'
import { getCurrentResources, pathResolve, isMultiRoots, hasRoot } from '../helper/util'

suite('Util Tests', () => {
  test('should resolve path correctly', () => {
    const testPath = 'test/file.txt'
    const resolvedPath = pathResolve(testPath)
    
    assert.strictEqual(typeof resolvedPath, 'string')
  })

  test('should check workspace roots correctly', () => {
    const hasRootResult = hasRoot()
    const isMultiRootsResult = isMultiRoots()
    
    assert.strictEqual(typeof hasRootResult, 'boolean')
    assert.strictEqual(typeof isMultiRootsResult, 'boolean')
  })

  test('should get current resources', async () => {
    const resources = await getCurrentResources()
    
    assert(Array.isArray(resources))
  })
})
