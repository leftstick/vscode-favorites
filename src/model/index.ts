import { FileStat } from '../enum';
import { Uri } from 'vscode';

export interface Item {
    filePath: string;
    stat: FileStat;
    group:string;
    uri?: Uri;
}

export interface ItemInSettingsJson {
    filePath:string;
    group:string;
}