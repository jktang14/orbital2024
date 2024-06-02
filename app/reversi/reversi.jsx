"use client";
import React, { createElement, useState, useEffect} from 'react';
import styles from './style.module.css';
import game from './game-logic';

const Reversi = () => {
    const [match, setMatch] = useState(new game());
    const [board, setBoard] = useState(match.board);
    const [currentPlayer, setCurrentPlayer] = useState(match.currentPlayer);
    const [message, setMessage] = useState("");
    const [isGameActive, setIsGameActive] = useState(true);
    const [hasGameStarted, setHasGameStarted] = useState(false);
    const [timer, setTimer] = useState(300);
    const [blackTime, setBlackTime] = useState(timer);
    const [whiteTime, setWhiteTime] = useState(timer);
    const [username, setUsername] = useState('');

    useEffect(() => {
        checkStatus();
    }, [board]);

    useEffect(() => {
        // Check if window and localStorage are available
        if (typeof window !== 'undefined') {
            const storedUsername = localStorage.getItem('username');
            if (storedUsername) {
                setUsername(storedUsername);
            }
        }
    }, []);

    useEffect(() => {
        let blackIntervalId;
        let whiteIntervalId;
        if (!isGameActive) {
            clearInterval(blackIntervalId);
            clearInterval(whiteIntervalId);
            return;
        }

        if (!hasGameStarted) {
            clearInterval(blackIntervalId);
            clearInterval(whiteIntervalId);
            return;
        }
        if (currentPlayer == 'Black') {
            blackIntervalId = setInterval(() => {
                setBlackTime(prev => {
                    let currTime = Math.max(prev - 1, 0);
                    if (currTime == 0) {
                        setMessage(`${currentPlayer} has run out of time, ${match.getOpponent()} wins!`)
                        setIsGameActive(false);
                        clearInterval(blackIntervalId);
                    }
                    return currTime;
                }); 
            }, 1000);
        } else {
            whiteIntervalId = setInterval(() => {
                setWhiteTime(prev => {
                    let currTime = Math.max(prev - 1, 0);
                    if (currTime == 0) {
                        setMessage(`${currentPlayer} has run out of time, ${match.getOpponent()} wins!`)
                        setIsGameActive(false);
                        clearInterval(whiteIntervalId);
                    }
                    return currTime;
                });
            }, 1000);
        }
        /*
        return () => {
            if (currentPlayer == 'Black') {
                clearInterval(blackIntervalId);
            } else {
                clearInterval(whiteIntervalId);
            }
        };
        */
        return () => {
            clearInterval(blackIntervalId);
            clearInterval(whiteIntervalId);
        };
    }, [isGameActive, currentPlayer]);

    function handleSlider(event) {
        const newTime = Number(event.target.value)
        setTimer(newTime);
        setBlackTime(newTime);
        setWhiteTime(newTime);
    }

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
            setCurrentPlayer(match.currentPlayer);
            //setCurrentPlayer(match.getOpponent()); // swap back to original player
        } else {
            setMessage("");
        }
    }

    function handleCellClick(rowIndex, colIndex) {
        if (!hasGameStarted) {
            setHasGameStarted(true);
        }

        if (isGameActive && match.isValidMove(rowIndex, colIndex)) {
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
        const newTimer = 300;
        setTimer(newTimer);
        setBlackTime(newTimer);
        setWhiteTime(newTimer);
    }

    function formatTime(seconds) {
        let minutes = Math.floor(seconds / 60);
        let second = seconds % 60;
        return `${minutes}:${second < 10 ? `0${second}` : `${second}`}`;
    }

    return (
        <div className={styles.body}>
            <div className={styles.enclosingContainer}>
                <div className={styles.gameNameTimer}>
                    <div className={styles.playerTurn}>
                        {isGameActive && <p style={{fontFamily: "fantasy", fontSize: "1.5rem", color: match.currentPlayer == "Black" ? "black": "white"}}>{match.currentPlayer} turn
                        </p>}
                    </div>
                    <div className={styles.nameTimer}>
                        <div> 
                            <p className ={styles.name}>{match.players.white.name} ({match.players.white.color})</p>
                        </div>
                        <div className={styles.timer}>
                            <p>{formatTime(whiteTime)}</p>    
                        </div>
                    </div>
                    <div className={styles.container}>
                        {match.board.map((row, rowIndex) => (
                            <div className={styles.row} key={rowIndex}>
                            {row.map((cell, colIndex) => (
                                <div className={styles.cell} key={colIndex} onClick={() => handleCellClick(rowIndex, colIndex)}>
                                    {cell == 'Black' && <img className={styles.image} src="black.png" alt="Black piece" />}
                                    {cell == 'White' && <img className={styles.image} src="white.png" alt="White piece" />}
                                    {match.isValidMove(rowIndex, colIndex) && <div className={styles.validMoveIndicator}></div>}
                                </div>
                            ))}
                            </div>
                        ))}
                    </div>
                    <div className={styles.nameTimer}>
                        <div> 
                            <p className={styles.name}>{username} ({match.players.black.color})</p>
                        </div>
                        <div className={styles.timer}>
                            <p>{formatTime(blackTime)}</p>    
                        </div>
                    </div>
                </div>
                <div className={styles.gameSelection}>
                    <div className={styles.timeSelection}>
                        <label>Select a time!</label><br/>
                        {hasGameStarted 
                        ? <input type="range" min="1" max="600" value={timer} className={styles.slider} onChange={handleSlider} disabled/> 
                        : <input type="range" min="1" max="600" value={timer} className={styles.slider} onChange={handleSlider}/>
                        }
                        <p>Time: {formatTime(timer)} </p>
                    </div>
                </div>
            </div>
            {message && <div className={styles.message}>{message}</div>}
            {!isGameActive && <button onClick={restartGame} className={styles.restartButton}>Restart game!</button>}
        </div>
    );
}

export default Reversi;
