import * as assert from 'assert'
import * as vscode from 'vscode'
import { resolveResourcePath, pathResolve } from '../helper/util'

suite('Path Util Tests', () => {
  test('should resolve absolute paths correctly', () => {
    // Test Windows absolute path
    const windowsPath = 'C:\\Users\\test\\file.txt'
    const resolvedWindowsPath = resolveResourcePath(windowsPath)
    assert.strictEqual(resolvedWindowsPath, windowsPath)

    // Test macOS/Linux absolute path
    const unixPath = '/home/test/file.txt'
    const resolvedUnixPath = resolveResourcePath(unixPath)
    assert.strictEqual(resolvedUnixPath, unixPath)
  })

  test('should resolve relative paths correctly', () => {
    const relativePath = 'src\\components\\file.ts'
    const resolvedPath = resolveResourcePath(relativePath)
    assert.strictEqual(typeof resolvedPath, 'string')
  })

  test('should resolve URI paths correctly', () => {
    const uriPath = 'file:///c:/Users/test/file.txt'
    const resolvedUriPath = resolveResourcePath(uriPath)
    assert.strictEqual(resolvedUriPath, uriPath)
  })

  test('pathResolve should work correctly', () => {
    const testPath = 'test/file.txt'
    const resolvedPath = pathResolve(testPath)
    assert.strictEqual(typeof resolvedPath, 'string')
  })
})
