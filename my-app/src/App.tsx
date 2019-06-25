import React, {FC, useRef, useState} from 'react';
import './App.css';
import {makeRequest} from './services/data.service';
import {AutoPlay} from './auto/Auto';
import Cell from './Cell';

/*Without tests and comments, sorry. But app is easy testable. If this is critical I can add*/


const App: FC = () => {
    const [lines, setLines] = useState<string[][]>([]);
    const [message, setMessage] = useState<string>();
    let levelSelectFef = useRef<HTMLSelectElement>(null);


    async function start() {
        const levelSelect = levelSelectFef.current;
        const level = levelSelect && levelSelect.options[levelSelect.selectedIndex].text;
        setLines([]);
        await makeRequest(`new ${level}`);
        createMap();
    }

    async function createMap() {
        const mapString = await makeRequest("map");
        updateBoard(mapString)
    }

    function updateBoard(mapString: string) {
        let lines;
        lines = mapString.split('\n');
        setLines(lines.map(line => line.split("")));
    }


    async function handelCellClick(x: number, y: number) {
        const res = await makeRequest(`open ${x} ${y}`);
        setMessage(res);
        createMap();
    }

    function runAuto() {
        const selectBox = levelSelectFef.current;
        if (!selectBox) return console.error('Level select box not found');
        const level = selectBox.options[selectBox.selectedIndex].text;
        if (level) {
            new AutoPlay(level, setLines);
        }
    }


    return (
        <div className="game">
            <header>
                <span>Level</span> <select ref={levelSelectFef}>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
            </select>
                <button onClick={start}>START</button>
                <button onClick={() => runAuto()}>AUTO PLAY</button>
                <span>{message}</span>
            </header>
            <div className="map">
                {lines.map((lineArray, y) =>
                    <div key={y}>
                        {lineArray.map((value, x) =>
                            <Cell key={x}
                                  value={value}
                                  onClick={() => handelCellClick(x, y)}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
