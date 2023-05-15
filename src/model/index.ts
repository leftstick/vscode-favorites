import { FileStat } from '../enum';
import { Uri } from 'vscode';

export interface Item {
    filePath: string;
    displayName: string;
    stat: FileStat;
    group:string;
    uri?: Uri;
}

export interface ItemInSettingsJson {
    filePath:string;
    displayName:string;
    group:string;
}