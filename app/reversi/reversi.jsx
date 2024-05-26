"use client";
import React, { createElement, useState, useEffect} from 'react';
import '../ui/style.css';
import game from './game-logic';

const Reversi = () => {
    let initialTime = 20;

    const [match, setMatch] = useState(new game());
    const [board, setBoard] = useState(match.board);
    const [currentPlayer, setCurrentPlayer] = useState(match.currentPlayer);
    const [message, setMessage] = useState("");
    const [isGameActive, setIsGameActive] = useState(true);
    const [hasGameStarted, setHasGameStarted] = useState(false);
    const [blackTime, setBlackTime] = useState(initialTime);
    const [whiteTime, setWhiteTime] = useState(initialTime);
    const [timer, setTimer] = useState(null);

    useEffect(() => {
        checkStatus();
    }, [board]);

    useEffect(() => {
        if (!isGameActive) {
            clearInterval(timer);
            return;
        }

        if (!hasGameStarted) {
            clearInterval(timer);
            return;
        }

        const intervalId = setInterval(() => {
            if (currentPlayer == 'black') {
                setBlackTime(prev => {
                    let currTime = Math.max(prev - 1, 0);
                    if (currTime == 0) {
                        setMessage(`${currentPlayer} has run out of time, ${match.getOpponent()} wins!`)
                        setIsGameActive(false);
                        clearInterval(intervalId);
                    }
                    return currTime;
                }); 
            } else {
                setWhiteTime(prev => {
                    let currTime = Math.max(prev - 1, 0);
                    if (currTime == 0) {
                        setMessage(`${currentPlayer} has run out of time, ${match.getOpponent()} wins!`)
                        setIsGameActive(false);
                        clearInterval(intervalId);
                    }
                    return currTime;
                });
            }
        }, 1000);

        setTimer(intervalId);
        return () => clearInterval(intervalId);
    }, [isGameActive, currentPlayer]);

    function checkStatus() {
        const result = match.checkGameStatus();
        if (result.status == 'win') {
            setMessage(`${result.winner} wins!`);
            setIsGameActive(false);
        } else if (result.status == 'draw') {
            setMessage('The game is a draw!');
            setIsGameActive(false);
        } else if (result.status == 'skip') {
            setMessage(result.message);
            setCurrentPlayer(match.getOpponent()); // swap back to original player
        } else {
            setMessage("");
        }
    }

    function handleCellClick(rowIndex, colIndex) {
        if (!hasGameStarted) {
            setHasGameStarted(true);
        }

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
        setHasGameStarted(false);
        setBlackTime(initialTime);
        setWhiteTime(initialTime);
        setTimer(null);
    }

    function formatTime(seconds) {
        let minutes = Math.floor(seconds / 60);
        let second = seconds % 60;
        return `${minutes}:${second < 10 ? `0${second}` : `${second}`}`;
    }

    return (
        <>
            <div className='game-name-timer'>
                <div className='name-timer'>
                    <div> 
                        <p className = 'name'>{match.players.white.name} ({match.players.white.color})</p>
                    </div>
                    <div className='timer'>
                        <p>{formatTime(whiteTime)}</p>    
                    </div>
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
                <div className='name-timer'>
                    <div> 
                        <p className='name'>{match.players.black.name} ({match.players.black.color})</p>
                    </div>
                    <div className='timer'>
                        <p>{formatTime(blackTime)}</p>    
                    </div>
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
