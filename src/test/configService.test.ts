import * as assert from 'assert'
import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'
import configMgr from '../helper/configMgr'

suite('Config Service Tests', () => {
  test('should get and save configuration', async () => {
    // Test saving to VS Code settings
    const testKey = 'testKey'
    const testValue = 'testValue'
    
    await configMgr.save(testKey, testValue)
    const retrievedValue = await configMgr.get(testKey)
    
    assert.strictEqual(retrievedValue, testValue)
    
    // Clean up
    await configMgr.save(testKey, undefined)
  })

  test('should handle separate configuration file', async () => {
    // This test requires a workspace folder
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
      return
    }
    
    const testKey = 'testKey'
    const testValue = 'testValue'
    
    // Enable separate config
    const config = vscode.workspace.getConfiguration('favorites')
    await config.update('saveSeparated', true, false)
    
    try {
      await configMgr.save(testKey, testValue)
      const retrievedValue = await configMgr.get(testKey)
      
      assert.strictEqual(retrievedValue, testValue)
      
      // Check if file exists
      const configFile = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, '.vscfavoriterc')
      assert.strictEqual(fs.existsSync(configFile), true)
      
      // Clean up
      await configMgr.save(testKey, undefined)
    } finally {
      // Disable separate config
      await config.update('saveSeparated', false, false)
    }
  })
})
