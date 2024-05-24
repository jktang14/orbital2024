"use client";
import React, { createElement, useState} from 'react';
import '../ui/style.css';
import game from './game-logic';

const Reversi = () => {
    const [match, setMatch] = useState(new game());
    const [board, setBoard] = useState(match.board);
    const [currentPlayer, setCurrentPlayer] = useState(match.currentPlayer);

    function handleCellClick(rowIndex, colIndex) {
        if (match.isValidMove(rowIndex, colIndex)) {
            match.makeMove(rowIndex, colIndex);
            setBoard(match.board);
        }
    }

    return (
        <div className="container">
            {match.board.map((row, rowIndex) => (
                <div className="row" key={rowIndex}>
                {row.map((cell, colIndex) => (
                    <div className="cell" key={colIndex} onClick={() => handleCellClick(rowIndex, colIndex)}>
                        {cell == 'black' && <img src="black.png" alt="Black piece" />}
                        {cell == 'white' && <img src="white.png" alt="White piece" />}
                    </div>
                ))}
                </div>
            ))}
        </div>
    );
}

export default Reversi;
