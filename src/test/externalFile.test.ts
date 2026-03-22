import * as assert from 'assert'
import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import { resolveResourcePath } from '../helper/util'

suite('External File Tests', () => {
  let externalFile: string

  setup(() => {
    // Create a test file outside the workspace
    externalFile = path.join(require('os').homedir(), 'test-external-file.txt')
    fs.writeFileSync(externalFile, 'test content for external file')
  })

  teardown(() => {
    // Clean up the test file
    if (fs.existsSync(externalFile)) {
      fs.unlinkSync(externalFile)
    }
  })

  test('should resolve external file paths correctly', () => {
    const resolvedPath = resolveResourcePath(externalFile)
    assert.strictEqual(resolvedPath, externalFile)
    assert.strictEqual(path.isAbsolute(resolvedPath), true)
  })

  test('should handle Windows absolute paths correctly', () => {
    // Test Windows-style absolute path
    if (process.platform === 'win32') {
      const windowsPath = 'C:\\Users\\test\\file.txt'
      const resolvedPath = resolveResourcePath(windowsPath)
      assert.strictEqual(resolvedPath, windowsPath)
    }
  })

  test('should handle Unix-style absolute paths correctly', () => {
    // Test Unix-style absolute path
    const unixPath = '/home/test/file.txt'
    const resolvedPath = resolveResourcePath(unixPath)
    assert.strictEqual(resolvedPath, unixPath)
  })
})
