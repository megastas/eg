import React, {FC, useState} from 'react';


interface CellProps {
    value: string,
    onClick: any,
    key: number
}

const Cell: FC<CellProps> = ({value, onClick}) => {
    const [bomb, setBomb] = useState(false);

    function contextMenuHandler(e: React.FormEvent<HTMLDivElement>) {
        e.preventDefault();
        setBomb(!bomb);
    }

    return (
        <div style={{backgroundColor: bomb ? "#f7c3c3" : undefined}}
             onContextMenu={contextMenuHandler}
             onClick={onClick}
             className="cell">
            {value}
        </div>
    );
}

export default Cell;
