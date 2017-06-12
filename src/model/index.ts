import {FileStat} from '../enum';

export interface Item {
    filePath: string;
    stat: FileStat;
}
