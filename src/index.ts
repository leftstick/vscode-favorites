// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "favorites" is now active!');


    const disposable = vscode.commands.registerCommand('extension.addToFavorites', (fileUri: vscode.Uri) => {
        // The code you place here will be executed every time your command is executed

        const fileName = fileUri.fsPath;
        const config = vscode.workspace.getConfiguration('favorites');

    });

    context.subscriptions.push(disposable);

}

// this method is called when your extension is deactivated
export function deactivate() {
}