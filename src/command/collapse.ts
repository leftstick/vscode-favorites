import * as vscode from 'vscode'

import { Resource, FavoritesProvider } from '../provider/FavoritesProvider'
import configMgr from '../helper/configMgr'

export function collapse(favoritesProvider: FavoritesProvider) {
    return vscode.commands.registerCommand('favorites.collapse', function (value: Resource) {



        favoritesProvider.returnEmpty = true;
        favoritesProvider.refresh();

        setTimeout(() => {
            favoritesProvider.returnEmpty = false;
            favoritesProvider.refresh();

        }, 400);




    });
}
