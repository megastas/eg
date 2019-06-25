import {makeRequest} from '../services/data.service';
import autoService from './auto.service';
import {POSITIVE, NEGATIVE, BOMB_SYMBOL, CELL_SYMBOL} from './constants';
import {Cell, Group} from './types';


export class AutoPlay {
    queue: Cell[] = [];
    map: any[][] = [];
    bombs: Cell[] = [];
    level: string;
    updateBoard?: (lines: string[][]) => void;

    constructor(level: string, updateBoard?: (lines: string[][]) => void) {
        this.level = level;
        this.updateBoard = updateBoard;
        this.init();
    }

    async init() {
        this.queue = [];
        this.map = [];
        this.bombs = [];

        await makeRequest(`new ${this.level}`);

        const firstStep = await makeRequest(`open ${5} ${5}`);

        if (firstStep === NEGATIVE) {
            this.init();
            return;
        }

        await this.doStep();
    }


    async doStep() {
        let cellGroups: Group[];
        this.map = await autoService.updateMap();
        this.map = autoService.markBombsOnMap(this.bombs, this.map);

        cellGroups = autoService.createCellGroups(this.map);

        if (this.updateBoard) {
            this.updateBoard(this.map);
        }

        this.findBombsAndSteps(cellGroups);

        if (!this.queue[0]) {
            this.findVariant(cellGroups);
        }

        this.clickCells(this.queue).then(res => {
            if (res) {
                this.queue = [];
                this.doStep();
            } else {
                this.init();
            }

        });
    }

    clickCells(queue: Cell[]) {
        let index = 0;
        return new Promise(async (resolve) => {
            const request = async () => {
                if (queue[index]) {
                    let res = await makeRequest(`open ${queue[index]['point'][1]} ${queue[index]['point'][0]}`);
                    if (res !== POSITIVE) {
                        if (res === NEGATIVE) {
                            resolve(false);
                        }
                    } else {
                        index++;
                        request();
                    }
                } else {
                    resolve(true);
                }
            }
            request();
        });
    }


    findBombsAndSteps(cellGroups: Group[]) {
        let isLastRound = false;

        const search = () => {
            let newBombs: Cell[] = [];

            cellGroups.forEach((group, index, array) => {
                let emptyCells: Cell[] = [];
                let bombs: Cell[] = [];

                group.cells.forEach(cell => {
                    if (cell.value === BOMB_SYMBOL) {
                        bombs.push(cell);
                    } else if (cell.value === CELL_SYMBOL) {
                        emptyCells.push(cell);
                    }
                });

                group.probability = !emptyCells.length ? 1 : (Number(group.value) - bombs.length) / emptyCells.length;

                if (group.probability === 1) {
                    autoService.addUniqueCells(emptyCells, newBombs);
                    array.splice(index, 1);
                } else if (group.probability === 0) {
                    autoService.addUniqueCells(emptyCells, this.queue);
                    array.splice(index, 1);
                }

            });

            this.updateCellGroups(cellGroups, newBombs);

            if (newBombs.length) {
                isLastRound = false;
                autoService.addUniqueCells(newBombs, this.bombs);
                search();
            } else {
                if (!isLastRound) {
                    isLastRound = true;
                    search();
                }
            }

        };

        search();
    }

    updateCellGroups(cellGroups: Group[], newBombs: Cell[]) {
        cellGroups.forEach((group) => {
            group.cells.forEach((cell, index, array) => {
                if (newBombs.find(bomb => cell.id === bomb.id)) {
                    cell.value = BOMB_SYMBOL;
                } else if (this.queue.find(queueCell => cell.id === queueCell.id)) {
                    array.splice(index, 1);
                }
            })
        });
    }


    findVariant(cellGroups: Group[]) {
        let result: Cell[] = [];
        let resultObject: { [k: string]: Cell[] } = {};

        cellGroups.forEach((group, index, array) => {
            group.cells.forEach(cell => {
                if (cell.value === BOMB_SYMBOL) {
                    return;
                }
                let field = resultObject[cell.id];
                cell.probability = group.probability;
                if (!field) {
                    resultObject[cell.id] = [cell];
                } else {
                    field.push(cell);
                }
            });
        });

        Object.keys(resultObject)
            .forEach(key => {
                resultObject[key].sort((a: Cell, b: Cell) => {
                    if (!b.probability || !a.probability) {
                        return 0;
                    }
                    return b.probability - a.probability;
                });
                result.push(resultObject[key][0]);
            });

        result.sort((a: Cell, b: Cell) => {
            if (!b.probability || !a.probability) {
                return 0;
            }
            return a.probability - b.probability;
        });

        this.queue.push(result[0]);
    }
}



