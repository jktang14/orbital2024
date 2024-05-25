"use client";
import React, { createElement, useState, useEffect} from 'react';
import '../ui/style.css';
import game from './game-logic';

const Reversi = () => {
    const [match, setMatch] = useState(new game());
    const [board, setBoard] = useState(match.board);
    const [currentPlayer, setCurrentPlayer] = useState(match.currentPlayer);
    const [message, setMessage] = useState("");

    useEffect(() => {
        checkStatus();
    }, [board]);

    function checkStatus() {
        const result = match.checkGameStatus();
        if (result.status === 'win') {
            setMessage(`${result.winner} wins!`);
        } else if (result.status === 'draw') {
            setMessage('The game is a draw!');
        } else if (result.status === 'skip') {
            setMessage(result.message);
            setCurrentPlayer(match.getOpponent()); // swap back to original player
        } else {
            setMessage("");
        }
    }

    function handleCellClick(rowIndex, colIndex) {
        if (match.isValidMove(rowIndex, colIndex)) {
            match.makeMove(rowIndex, colIndex);
            setBoard(match.board);
            setCurrentPlayer(match.currentPlayer); // current player has internally swapped within makeMove
        }
    }

    return (
        <>
            <div className="container">
                {match.board.map((row, rowIndex) => (
                    <div className="row" key={rowIndex}>
                    {row.map((cell, colIndex) => (
                        <div className="cell" key={colIndex} onClick={() => handleCellClick(rowIndex, colIndex)}>
                            {cell == 'black' && <img src="black.png" alt="Black piece" />}
                            {cell == 'white' && <img src="white.png" alt="White piece" />}
                            {match.isValidMove(rowIndex, colIndex) && <div className='valid-move-indicator'></div>}
                        </div>
                    ))}
                    </div>
                ))}
            </div>
            <div className="player-turn">
                {match.currentPlayer} turn
            </div>
            {message && <div className="message">{message}</div>}
        </>
    );
}

export default Reversi;
