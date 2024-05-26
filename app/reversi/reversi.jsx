"use client";
import React, { createElement, useState, useEffect} from 'react';
import '../ui/style.css';
import game from './game-logic';

const Reversi = () => {
    const [match, setMatch] = useState(new game());
    const [board, setBoard] = useState(match.board);
    const [currentPlayer, setCurrentPlayer] = useState(match.currentPlayer);
    const [message, setMessage] = useState("");
    const [isGameActive, setIsGameActive] = useState(true);

    useEffect(() => {
        checkStatus();
    }, [board]);

    function checkStatus() {
        const result = match.checkGameStatus();
        if (result.status === 'win') {
            setMessage(`${result.winner} wins!`);
            setIsGameActive(false);
        } else if (result.status === 'draw') {
            setMessage('The game is a draw!');
            setIsGameActive(false);
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

    function restartGame() {
        let newGame = new game();
        setMatch(newGame);
        setBoard(newGame.board);
        setCurrentPlayer(newGame.currentPlayer);
        setMessage("");
        setIsGameActive(true);
    }

    return (
        <>
            <div className='game-name-timer'>
                <div> 
                    <p>{match.players.white.name} ({match.players.white.color})</p>
                </div>
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
                <div> 
                    <p>{match.players.black.name} ({match.players.black.color})</p>
                </div>
            </div>
            <div className="player-turn">
                {isGameActive && <p>{match.currentPlayer} turn</p>}
            </div>
            {message && <div className="message">{message}</div>}
            {!isGameActive && <button onClick={restartGame} className='restart-button'>Restart game!</button>}
        </>
    );
}

export default Reversi;
