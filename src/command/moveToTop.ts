import * as vscode from 'vscode';

import { Resource, FavoritesProvider } from '../provider/FavoritesProvider';

export function moveToTop(favoritesProvider: FavoritesProvider) {
    return vscode.commands.registerCommand('favorites.moveToTop', async function (value: Resource) {
        const config = vscode.workspace.getConfiguration('favorites');

        const items = await favoritesProvider.getChildren();

        const currentIndex = items.findIndex(i => i.value === value.value);
        if (currentIndex === 0) {
            return;
        }

        const resources: Array<string> = [];

        resources.push(value.value);

        for (let i = 0; i < items.length; i++) {
            if (i === currentIndex) {
                continue;
            }
            resources.push(items[i].value);
        }

        config.update('sortOrder', 'MANUAL', false);
        config.update('resources', resources, false);
    });
}
