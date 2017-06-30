import * as vscode from 'vscode';

export function addToFavorites() {
    const { rootPath } = vscode.workspace;

    return vscode.commands.registerCommand('favorites.addToFavorites', (fileUri?: vscode.Uri) => {

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
}
