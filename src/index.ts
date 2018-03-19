// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { FavoritesProvider } from './provider/FavoritesProvider'
import configMgr from './helper/configMgr'
import { setSortAsc, setSortDesc } from "./command/toggleSort";
import { collapse } from "./command/collapse";

declare var global: any;

import {
    addToFavorites,
    deleteFavorite,
    moveUp,
    moveDown,
    moveToTop,
    moveToBottom,
    toggleSort
} from './command'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    const config = vscode.workspace.getConfiguration('favorites')
    const configSort = <string>config.get('sortOrder');
    const sort = (configSort === "DESC" || configSort === "ASC") ? configSort : "ASC";

    vscode.commands.executeCommand('setContext', 'sort', sort);
    config.update('sortOrder', sort, false)


    global.vscode = vscode;
    global.commands = [];

    vscode.commands.getCommands(false)
        .then((l) => global.commands = l);


    console.log('Congratulations, your extension "favorites" is now active!')

    configMgr.onConfigChange(() => {
        favoritesProvider.refresh()
    })

    const favoritesProvider = new FavoritesProvider()

    vscode.window.registerTreeDataProvider('favorites', favoritesProvider)

    vscode.workspace.onDidChangeConfiguration(
        () => {
            favoritesProvider.refresh()
        },
        this,
        context.subscriptions
    )

    context.subscriptions.push(addToFavorites())
    context.subscriptions.push(deleteFavorite())
    context.subscriptions.push(setSortAsc(favoritesProvider))
    context.subscriptions.push(setSortDesc(favoritesProvider))
    context.subscriptions.push(collapse(favoritesProvider))
}

// this method is called when your extension is deactivated
export function deactivate() { }
