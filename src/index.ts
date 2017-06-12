// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { FavoritesProvider, Resource } from './provider/FavoritesProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "favorites" is now active!');

    const rootPath = vscode.workspace.rootPath;
    const favoritesProvider = new FavoritesProvider(rootPath);

    vscode.window.registerTreeDataProvider('favorites', favoritesProvider);

    vscode.workspace.onDidChangeConfiguration(() => {
        favoritesProvider.refresh();
    }, this, context.subscriptions);



    const addToFavoritesDisposable = vscode.commands.registerCommand('favorites.addToFavorites', (fileUri?: vscode.Uri) => {

        if (!fileUri) {
            return vscode.window.showWarningMessage('You have to call this extension from explorer');
        }

        const fileName = fileUri.fsPath;
        const config = vscode.workspace.getConfiguration('favorites');

        const previousResources: Array<string> = <Array<string>>config.get('resources');
        const newResource: string = fileName.substr(rootPath.length + 1);

        if (previousResources.some(r => r === newResource)) {
            return;
        }
        config.update('resources', previousResources.concat([newResource]), false);

    });

    const deleteFavoriteDisposable = vscode.commands.registerCommand('favorites.deleteFavorite', (value: Resource) => {
        const config = vscode.workspace.getConfiguration('favorites');
        const previousResources: Array<string> = <Array<string>>config.get('resources');
        config.update('resources', previousResources.filter(r => r !== value.value), false);
    });

    context.subscriptions.push(addToFavoritesDisposable);
    context.subscriptions.push(deleteFavoriteDisposable);

}

// this method is called when your extension is deactivated
export function deactivate() {
}