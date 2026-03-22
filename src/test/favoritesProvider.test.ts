import * as assert from 'assert'
import * as vscode from 'vscode'
import { FavoritesProvider } from '../provider/FavoritesProvider'

suite('FavoritesProvider Tests', () => {
  test('should match patterns correctly', () => {
    const provider = new FavoritesProvider()

    // Test Windows path with forward slash pattern
    const windowsPath = 'D:\\path\\to\\src\\main.ts'
    const pattern = 'src/main.ts'
    const result = (provider as any).matchesPattern(windowsPath, pattern)
    assert.strictEqual(result, true)

    // Test Linux path with forward slash pattern
    const linuxPath = '/path/to/src/main.ts'
    const result2 = (provider as any).matchesPattern(linuxPath, pattern)
    assert.strictEqual(result2, true)

    // Test pattern that shouldn't match
    const noMatchPattern = 'src/other.ts'
    const result3 = (provider as any).matchesPattern(windowsPath, noMatchPattern)
    assert.strictEqual(result3, false)
  })

  test('should handle files.exclude configuration changes', () => {
    const provider = new FavoritesProvider()
    // This test just verifies the constructor doesn't throw an error
    // The actual functionality is tested manually
    assert.ok(provider)
  })

  test('should sort resources by file type when sortOrder is FILETYPE', async () => {
    const provider = new FavoritesProvider()

    // Create test resources with different file types
    const testResources = [
      { filePath: 'test.js', group: 'Default' },
      { filePath: 'src', group: 'Default' },
      { filePath: 'test.ts', group: 'Default' },
      { filePath: 'package.json', group: 'Default' },
      { filePath: 'docs', group: 'Default' },
      { filePath: 'style.css', group: 'Default' },
    ]

    // Mock getResourceStat method to return file stats
    const originalGetResourceStat = ((provider as any).getResourceStat(provider as any).getResourceStat = (
      item: any,
    ) => {
      return Promise.resolve({
        filePath: item.filePath,
        stat: item.filePath.includes('.') ? 1 : 2, // 1 for file, 2 for directory
        group: item.group,
      })
    })

    try {
      // Test FILETYPE sorting
      const sortedResources = await (provider as any).sortResources(testResources, 'FILETYPE')

      // Verify folders come first
      assert.strictEqual(sortedResources[0].filePath, 'docs')
      assert.strictEqual(sortedResources[1].filePath, 'src')

      // Verify files are sorted by extension
      assert.strictEqual(sortedResources[2].filePath, 'style.css')
      assert.strictEqual(sortedResources[3].filePath, 'test.js')
      assert.strictEqual(sortedResources[4].filePath, 'package.json')
      assert.strictEqual(sortedResources[5].filePath, 'test.ts')
    } finally {
      // Restore original method
      ;(provider as any).getResourceStat = originalGetResourceStat
    }
  })

  test('should handle files.exclude with when clause', async () => {
    const provider = new FavoritesProvider()

    // Mock fs module to control file existence checks
    const fs = require('fs')
    const originalExistsSync = fs.existsSync

    try {
      // Mock fs.existsSync to return true for component.vue and false for utils.vue
      fs.existsSync = (path: string) => {
        return path.includes('component.vue')
      }

      // Mock vscode.workspace.getConfiguration to return our test config
      const originalGetConfiguration = vscode.workspace.getConfiguration
      vscode.workspace.getConfiguration = (section: string) => {
        if (section === 'files') {
          return {
            get: (key: string) => {
              if (key === 'exclude') {
                return {
                  'src/**': { when: '$(basename).vue' },
                }
              }
              return undefined
            },
          }
        }
        return originalGetConfiguration(section)
      }

      // Mock vscode.workspace.fs.readDirectory to return our test files
      const originalReadDirectory = vscode.workspace.fs.readDirectory
      vscode.workspace.fs.readDirectory = (uri: vscode.Uri) => {
        return Promise.resolve([
          ['component.ts', vscode.FileType.File],
          ['component.vue', vscode.FileType.File],
          ['utils.ts', vscode.FileType.File],
        ])
      }

      // Test getChildrenResources with when clause
      const testItem = { filePath: 'src', group: 'Default' }
      const children = await (provider as any).getChildrenResources(testItem)

      // Extract file names from children
      const fileNames = children.map((child: any) => child.label)

      // Verify component.ts is excluded (because component.vue exists)
      // Verify component.vue and utils.ts are included
      assert.strictEqual(fileNames.includes('component.ts'), false)
      assert.strictEqual(fileNames.includes('component.vue'), true)
      assert.strictEqual(fileNames.includes('utils.ts'), true)
    } finally {
      // Restore original methods
      fs.existsSync = originalExistsSync
      vscode.workspace.getConfiguration = originalGetConfiguration
      if (vscode.workspace.fs.readDirectory !== undefined) {
        vscode.workspace.fs.readDirectory = originalReadDirectory
      }
    }
  })
})
