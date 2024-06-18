"use client";
import React, { createElement, useState, useEffect, useRef} from 'react';
import styles from './style.module.css';
import game from './game-logic';
import { realtimeDatabase } from '../firebase';
import { ref, update, set, onValue, push } from 'firebase/database';

const Reversi = () => {
    const [boardSize, setBoardSize] = useState(8);
    const [match, setMatch] = useState(new game(boardSize));
    const [board, setBoard] = useState(match.board);
    const [currentPlayer, setCurrentPlayer] = useState(match.currentPlayer);
    const [message, setMessage] = useState("");
    const [isGameActive, setIsGameActive] = useState(true);
    const [hasGameStarted, setHasGameStarted] = useState(false);
    const [timer, setTimer] = useState(300);
    const [blackTime, setBlackTime] = useState(timer);
    const [whiteTime, setWhiteTime] = useState(timer);
    const [username, setUsername] = useState('');
    const [gameId, setGameId] = useState(null);
    const [inputGameId, setInputGameId] = useState("");

    useEffect(() => {
        if (gameId) {
            const gameRef = ref(realtimeDatabase, `games/${gameId}`);
            onValue(gameRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    setBoard(convertSparseObjectTo2DArray(data.board));
                    setCurrentPlayer(data.currentPlayer);
                    setMessage(data.message);
                    setIsGameActive(data.isGameActive);
                    setHasGameStarted(data.hasGameStarted);
                    setBlackTime(data.blackTime);
                    setWhiteTime(data.whiteTime);
                    setMatch(game.fromData(data.boardSize, data.board, data.currentPlayer));
                }
            });
        }
    }, [gameId]);
    
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
        return () => {
            clearInterval(blackIntervalId);
            clearInterval(whiteIntervalId);
        };
    }, [isGameActive, currentPlayer]);

    function convertSparseObjectTo2DArray(boardObject) {
        const size = 8; // Assuming board size is known
        let boardArray = Array(size).fill(null).map(() => Array(size).fill(null));
    
        // Iterate over keys in the boardObject and fill the boardArray
        Object.keys(boardObject).forEach(rowIndex => {
            Object.keys(boardObject[rowIndex]).forEach(colIndex => {
                boardArray[parseInt(rowIndex)][parseInt(colIndex)] = boardObject[rowIndex][colIndex];
            });
        });
    
        return boardArray;
    }

    const createNewGame = () => {
        const newGameRef = ref(realtimeDatabase, 'games');
        const newGameKey = push(newGameRef).key;

        setGameId(newGameKey);
        
        const newMatch = new game(boardSize);

        set(ref(realtimeDatabase, `games/${newGameKey}`), {
            match: newMatch,
            board: newMatch.board,
            boardSize: boardSize,
            currentPlayer: newMatch.currentPlayer,
            players: {black: {name: username, color: "Black"}},
            message: "",
            isGameActive: true,
            hasGameStarted: false,
            blackTime: timer,
            whiteTime: timer
        });

        setMatch(newMatch);
        setBoard(newMatch.board);
        setBoardSize(boardSize);
        setCurrentPlayer(newMatch.currentPlayer);
        setMessage("");
        setIsGameActive(true);
        setHasGameStarted(false);
        setBlackTime(timer); 
        setWhiteTime(timer);
    };

    const joinGame = () => {
        if (inputGameId) {
            const gameRef = ref(realtimeDatabase, `games/${inputGameId}`);
            
            onValue(gameRef, (snapshot) => {
                const gameData = snapshot.val();
                if (gameData) {
                        // Add the second player to the game
                        const updatedPlayers = {
                            ...gameData.players,
                            white: { name: username || 'Player 2', color: "White" }
                        };
    
                        // Update game data in Firebase
                        update(gameRef, {
                            players: updatedPlayers,
                        });
    
                        // Set gameId in state to start listening for updates
                        setGameId(inputGameId);
                } else {
                    alert("Game not found!");
                }
            });
        } else {
            alert("Please enter a valid Game ID!");
        }
    };

    const updateGameState = (updates) => {
        if (gameId) {
            const gameRef = ref(realtimeDatabase, `games/${gameId}`);
            update(gameRef, updates);
        }
    };

    function handleSlider(event) {
        const newTime = Number(event.target.value)
        setTimer(newTime);
        setBlackTime(newTime);
        setWhiteTime(newTime);
    }

    function handleBoardSizeChange(size) {
        setBoardSize(size);
        let newGame = new game(size);
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
        } else {
            setMessage("");
        }
    }

    function handleCellClick(rowIndex, colIndex) {
        if (!hasGameStarted) {
            setHasGameStarted(true);
            updateGameState({ hasGameStarted: true });
        }

        if (isGameActive && match.isValidMove(rowIndex, colIndex)) {
            match.makeMove(rowIndex, colIndex);
            setBoard(match.board);
            setCurrentPlayer(match.currentPlayer); // current player has internally swapped within makeMove
            updateGameState({
                board: match.board,
                currentPlayer: match.currentPlayer,
            });
        }
    }

    function restartGame() {
        let newGame = new game(boardSize);
        setBoardSize(boardSize);
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
                    <div className={styles.container} style = {{gridTemplateRows: `repeat(${boardSize}, 1fr)`}}>
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
                    <div className={styles.gridSelection}>
                        <div style={{color: "black", paddingBottom: "2px"}}>Change the grid size!</div>
                        <div className={styles.gridButton}>
                            {hasGameStarted 
                            ? <button onClick={() => handleBoardSizeChange(6)} disabled>6x6</button>
                            : <button onClick={() => handleBoardSizeChange(6)}>6x6</button>}
                            {hasGameStarted 
                            ? <button onClick={() => handleBoardSizeChange(8)} disabled>8x8</button>
                            : <button onClick={() => handleBoardSizeChange(8)}>8x8</button>}
                            {hasGameStarted 
                            ? <button onClick={() => handleBoardSizeChange(10)} disabled>10x10</button>
                            : <button onClick={() => handleBoardSizeChange(10)}>10x10</button>}
                            {hasGameStarted 
                            ? <button onClick={() => handleBoardSizeChange(12)} disabled>12x12</button>
                            : <button onClick={() => handleBoardSizeChange(12)}>12x12</button>}
                        </div>
                    </div>
                </div>
            </div>
            {message && <div className={styles.message}>{message}</div>}
            {!isGameActive && <button onClick={restartGame} className={styles.restartButton}>Restart game!</button>}
            <div>
                <button onClick={createNewGame}>Create Game</button>
                <input 
                    type="text" 
                    placeholder="Enter Game ID" 
                    value={inputGameId} 
                    onChange={(e) => setInputGameId(e.target.value)} 
                />
                <button onClick={joinGame}>Join Game</button>
            </div>
        </div>
    );
}

export default Reversi;
