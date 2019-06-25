import {makeRequest} from "../services/data.service";
import {BOMB_SYMBOL, CELL_SYMBOL, EMPTY_CELL_CODE} from './constants';
import {Cell, Group} from './types';


export default {

    addUniqueCells: function (from: Cell[], to: Cell[]) {
        from.forEach(
            cell => to.find(cell2 => cell.id === cell2.id)
                ? undefined : to.push(cell)
        )
    },


    updateMap: async function (): Promise<any[][]> {
        const mapString: string = await makeRequest("map");
        return mapString.split('\n')
            .map(line => line
                .split('')
                .map(cell => {
                    let code = cell.charCodeAt(0).toString(16);
                    return code === EMPTY_CELL_CODE ? CELL_SYMBOL : Number(cell);
                }));
    },

    markBombsOnMap: function (bombs: Cell[], map: any[][]): any[][] {
        bombs.forEach(bomb => {
            map[bomb.point[0]][bomb.point[1]] = BOMB_SYMBOL;
        });
        return map;
    },


    createCellGroups: function (map: any[][]): Group[] {
        const cellGroups: Group[] = [];
        const yLength: number = map.length;
        const xLength: number = map[0].length;

        for (let y = 0; y < yLength; y++) {
            for (let x = 0; x < xLength; x++) {
                let value = map[y][x];
                if (value !== 0 && value !== CELL_SYMBOL && value !== BOMB_SYMBOL) {
                    let group = getGroup(x, y, map);
                    if (!group.find(cell => cell.value === CELL_SYMBOL)) {
                        continue;
                    }
                    cellGroups.push({
                        cells: group,
                        value: value,
                    });
                }
            }
        }
        return cellGroups;
    }

}


export function getGroup(x: number, y: number, map: any[][]): Cell[] {
    const variants: Cell[] = [];
    const checkAndUpdate = (point: number[]) => {
        let value = map[point[0]][point[1]];
        return value === CELL_SYMBOL || value === BOMB_SYMBOL ? variants.push({
            point,
            value,
            id: JSON.stringify(point)
        }) : undefined
    };

    let currentLine = [
        [y, x - 1],
        [y, x + 1],
    ];

    let topLine = [
        [y - 1, x - 1],
        [y - 1, x],
        [y - 1, x + 1]
    ];

    let bottomLine = [
        [y + 1, x - 1],
        [y + 1, x],
        [y + 1, x + 1]
    ];

    currentLine.forEach(checkAndUpdate);

    if (map[y - 1]) {
        topLine.forEach(checkAndUpdate);
    }

    if (map[y + 1]) {
        bottomLine.forEach(checkAndUpdate);
    }

    return variants;
}