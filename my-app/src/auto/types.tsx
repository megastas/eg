export type cellValue = number | string;

export interface Cell {
    point: number[];
    id: string;
    value: cellValue;
    probability?: number;
}

export interface Group {
    value: cellValue;
    cells: Cell[];
    probability?: number;
}
