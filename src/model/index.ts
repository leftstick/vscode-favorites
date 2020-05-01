import { FileStat } from '../enum';
import { Uri } from 'vscode';

export interface Item {
    filePath: string;
    stat: FileStat;
    uri?: Uri;
}
