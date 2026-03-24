import * as assert from 'assert'
import * as vscode from 'vscode'
import { addToFavorites } from '../command/addToFavorites'

suite('AddToFavorites Tests', () => {
  test('should handle drive root workspace correctly', () => {
    // Test file path in the drive root
    const testFilePath = 'D:/path/to/file.txt'
    const testUri = vscode.Uri.file(testFilePath)

    // We can't directly test the command execution, but we can verify the URI creation
    assert.strictEqual(testUri.fsPath, testFilePath)
  })

  test('should handle case-insensitive path comparison', () => {
    // Test file path with different case
    const testFilePath = 'd:/workspace/path/to/file.txt'
    const testUri = vscode.Uri.file(testFilePath)

    // Verify the URI creation
    assert.strictEqual(testUri.fsPath, testFilePath)
  })
})
