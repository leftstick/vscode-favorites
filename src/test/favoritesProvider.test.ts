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
})
