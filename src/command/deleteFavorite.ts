import * as vscode from 'vscode';

import { Resource } from '../provider/FavoritesProvider';

export function deleteFavorite() {

    return vscode.commands.registerCommand('favorites.deleteFavorite', (value: Resource) => {
        const config = vscode.workspace.getConfiguration('favorites');
        const previousResources: Array<string> = <Array<string>>config.get('resources');
        config.update('resources', previousResources.filter(r => r !== value.value), false);
    });
}
