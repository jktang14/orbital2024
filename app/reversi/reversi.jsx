"use client";
import React, { createElement, useState, useEffect, useRef, forwardRef, useImperativeHandle} from 'react';
import styles from './style.module.css';
import game from './game-logic';
import { realtimeDatabase, db } from '../firebase';
import { ref, update, set, onValue, push } from 'firebase/database';
import createNewGame from './online/create-game';
import joinGame from './online/join-game';
import { toast, Bounce } from 'react-toastify';
import { AddGameRequest } from '../components/add-game-request';
import { GameInvitation } from '../components/game-invitation';
import { DeclineGameRequest } from '../components/decline-game-request';
import { query, collection, where, getDocs, doc, onSnapshot} from "firebase/firestore";


const Reversi = () => {
    const [boardSize, setBoardSize] = useState(8);
    const [match, setMatch] = useState(new game(boardSize));
    const [status, setStatus] = useState('local');
    const [board, setBoard] = useState(match.board);
    const [currentPlayer, setCurrentPlayer] = useState(match.currentPlayer);
    const [userColor, setUserColor] = useState(match.currentPlayer);
    const [message, setMessage] = useState("");
    const [isGameActive, setIsGameActive] = useState(true);
    const [hasGameStarted, setHasGameStarted] = useState(false);
    const [timer, setTimer] = useState(300);
    const [blackTime, setBlackTime] = useState(timer);
    const [whiteTime, setWhiteTime] = useState(timer);
    const [username, setUsername] = useState('');
    const [gameId, setGameId] = useState(null);
    const [inputGameId, setInputGameId] = useState("");
    const [friendToPlay, setFriendToPlay] = useState('');
    
    useEffect(() => {
        if (gameId) {
            const gameRef = ref(realtimeDatabase, `games/${gameId}`);
            onValue(gameRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    setBoardSize(data.boardSize);
                    setStatus(data.status);
                    setBoard(convertSparseObjectTo2DArray(data.board, boardSize));
                    setCurrentPlayer(data.currentPlayer);
                    setMessage(data.message);
                    setIsGameActive(data.isGameActive);
                    setHasGameStarted(data.hasGameStarted);
                    setBlackTime(data.blackTime);
                    setWhiteTime(data.whiteTime);
                    setMatch(game.fromData(data.boardSize, data.board, data.currentPlayer, data.players));
                }
            });
        }
    }, [gameId]);

    // Check for updates in gameRequests array
    useEffect(() => {
        const handleGameRequests = async () => {
            if (username) {
                const q = query(collection(db, 'users'), where('username', '==', username));
                const querySnapshot = await getDocs(q);
                const userId = querySnapshot.docs[0].id;
                const userDoc = doc(db, 'users', userId);
        
                const unsubscribe = onSnapshot(userDoc, async (doc) => {
                    const userData = doc.data();
                    const gameRequests = userData.gameRequests;
                    if (Array.isArray(gameRequests)) {
                        gameRequests.forEach(request => {
                            const toastId = toast(<GameInvitation 
                                request={request.username} 
                                onAccept={() => joinCurrentGame(request.gameId, request, toastId)}
                                onDecline={() => declineGame(request, toastId)}
                        />, {
                            position: "top-left",
                            autoClose: false,
                            hideProgressBar: false,
                            closeOnClick: false,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "light",
                            closeButton: false,
                            transition: Bounce,
                            })
                        })
                    }
                })
        
                return () => unsubscribe();
            }
        }
        handleGameRequests();
    }, [username])
    
    useEffect(() => {
        checkStatus();
    }, [board]);

    useEffect(() => {
        // Check if window and localStorage are available
        if (typeof window !== 'undefined') {
            const friendToPlay = localStorage.getItem('friendToPlay');
            if (friendToPlay) {
                setFriendToPlay(friendToPlay);
            }
        }
    }, []);

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
                        const text = `${currentPlayer} has run out of time, ${match.getOpponent()} wins!`;
                        setMessage(text);
                        setIsGameActive(false);
                        updateGameState({message: text, isGameActive: false});
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
                        const text = `${currentPlayer} has run out of time, ${match.getOpponent()} wins!`;
                        setMessage(text);
                        setIsGameActive(false);
                        updateGameState({message: text, isGameActive: false});
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

    useEffect(() => {
        if (gameId) {
            const id = setInterval(() => {
                updateGameState({blackTime: blackTime}),
                updateGameState({whiteTime: whiteTime})
            })
            return (() => {
                clearInterval(id);
            })
        }
    }, [gameId, blackTime, whiteTime])

    function convertSparseObjectTo2DArray(boardObject, boardSize) {
        const size = boardSize; // Assuming board size is known
        let boardArray = Array(size).fill(null).map(() => Array(size).fill(null));
    
        // Iterate over keys in the boardObject and fill the boardArray
        Object.keys(boardObject).forEach(rowIndex => {
            Object.keys(boardObject[rowIndex]).forEach(colIndex => {
                boardArray[parseInt(rowIndex)][parseInt(colIndex)] = boardObject[rowIndex][colIndex];
            });
        });
    
        return boardArray;
    }

    const handleSendInvitation = async () => {
        try {
            const gameId = createGame();
            await AddGameRequest(username, friendToPlay, gameId);
            alert(`Invitation sent to ${friendToPlay}`)
        } catch (error) {
            console.log(error.message);
        }
    }

    const declineGame = async (request, toastId) => {
        try {
            await DeclineGameRequest(request, username);
            toast.dismiss(toastId);
        } catch (error) {
            console.log(error.message);
        }
    }

    const createGame = () => {
        return createNewGame(boardSize, username, setStatus, setGameId, setMatch, setBoard, setBoardSize, setCurrentPlayer, setMessage, setIsGameActive, setHasGameStarted, timer, setBlackTime, setWhiteTime);
    };

    const joinCurrentGame = (gameId, request, toastId) => {
        joinGame(gameId, username, setGameId, setUserColor);
        declineGame(request, toastId);
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
        setTimer(timer);
        setBlackTime(timer);
        setWhiteTime(timer);
    }

    function checkStatus() {
        const result = match.checkGameStatus();
        if (result.status == 'win') {
            const text = `${result.winner} wins!`;
            setMessage(text);
            setIsGameActive(false);
            updateGameState({
                message: text,
                isGameActive: false
            });
        } else if (result.status == 'draw') {
            const text = 'The game is a draw!';
            setMessage(text);
            setIsGameActive(false);
            updateGameState({
                message: text,
                isGameActive: false
            });
        } else if (result.status == 'skip') {
            setMessage(result.message);
            setCurrentPlayer(match.currentPlayer);
            updateGameState({
                message: result.message,
                currentPlayer: match.currentPlayer
            });
        } else {
            setMessage(message);
        }
    }

    function handleCellClick(rowIndex, colIndex) {
        if (!hasGameStarted) {
            setHasGameStarted(true);
            updateGameState({ hasGameStarted: true });
        }

        if (gameId) {
            if (isGameActive && match.isValidMove(rowIndex, colIndex) && currentPlayer == userColor) {
                match.makeMove(rowIndex, colIndex);
                setBoard(match.board);
                setCurrentPlayer(match.currentPlayer); // current player has internally swapped within makeMove
                updateGameState({
                    board: match.board,
                    currentPlayer: match.currentPlayer,
                });
            }
        } else {
            if (isGameActive && match.isValidMove(rowIndex, colIndex)) {
                match.makeMove(rowIndex, colIndex);
                setBoard(match.board);
                setCurrentPlayer(match.currentPlayer); // current player has internally swapped within makeMove
            }
        }
    }

    function restartGame() {
        if (status == 'local') {
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
    }

    function formatTime(seconds) {
        let minutes = Math.floor(seconds / 60);
        let second = seconds % 60;
        return `${minutes}:${second < 10 ? `0${second}` : `${second}`}`;
    }

    function opponentColor(userColor) {
        return userColor == "Black" ? "White" : "Black";
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
                            {<p className ={styles.name}>{"white" in match.players ? match.players[userColor == "Black" ? "white" : "black"].name: "Player 2"} ({opponentColor(userColor)})</p>}
                        </div>
                        <div className={styles.timer}>
                            <p>{formatTime(userColor == "Black" ? whiteTime: blackTime)}</p>    
                        </div>
                    </div>
                    <div className={styles.container} style = {{gridTemplateRows: `repeat(${boardSize}, 1fr)`}}>
                        {match.board.map((row, rowIndex) => (
                            <div className={styles.row} key={rowIndex}>
                            {row.map((cell, colIndex) => (
                                <div className={styles.cell} key={colIndex} onClick={() => handleCellClick(rowIndex, colIndex)}>
                                    {cell == 'Black' && <img className={styles.image} src="black.png" alt="Black piece" />}
                                    {cell == 'White' && <img className={styles.image} src="white.png" alt="White piece" />}
                                    {gameId
                                    ? (currentPlayer == userColor && match.isValidMove(rowIndex, colIndex)) && <div className={styles.validMoveIndicator}></div>
                                    : match.isValidMove(rowIndex, colIndex) && <div className={styles.validMoveIndicator}></div>}
                                </div>
                            ))}
                            </div>
                        ))}
                    </div>
                    <div className={styles.nameTimer}>
                        <div> 
                            <p className={styles.name}>{username} ({userColor})</p>
                        </div>
                        <div className={styles.timer}>
                            <p>{formatTime(userColor == "Black" ? blackTime: whiteTime)}</p>    
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
                    {!hasGameStarted && <button onClick={handleSendInvitation}>Start</button>}
                </div>
            </div>
            {message && <div className={styles.message}>{message}</div>}
            {!isGameActive && <button onClick={restartGame} className={styles.restartButton}>Restart game!</button>}
        </div>
    );
};

export default Reversi;
