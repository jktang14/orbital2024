"use client";
import React, { createElement, useState, useEffect, useRef, forwardRef, useImperativeHandle} from 'react';
import styles from './style.module.css';
import game from './game-logic';
import { realtimeDatabase, db } from '../firebase';
import { ref, update, set, onValue, push, remove } from 'firebase/database';
import createNewGame from './online/create-game';
import joinGame from './online/join-game';
import { toast, Bounce } from 'react-toastify';
import { AddGameRequest } from '../components/add-game-request';
import { GameInvitation } from '../components/game-invitation';
import { DeclineGameRequest } from '../components/decline-game-request';
import { query, collection, where, getDocs, doc, onSnapshot} from "firebase/firestore";
import { RemoveGameRequest } from '../components/remove-game-request';

const Reversi = () => {
    const [boardSize, setBoardSize] = useState(8);
    const [match, setMatch] = useState(new game(boardSize));
    const [status, setStatus] = useState('local');
    const [mode, setMode] = useState('standard');
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
    const [friendToPlay, setFriendToPlay] = useState('');
    const [rematchFriend, setRematchFriend] = useState('');
    // true when player has made a move and can now choose which square to block
    const [blockModeActive, setBlockModeActive] = useState(false);
    const [availableCellsToBlock, setAvailableCellsToBlock] = useState(null);
    const [blockedPlayer, setBlockedPlayer] = useState('');
    
    useEffect(() => {
        if (gameId) {
            const gameRef = ref(realtimeDatabase, `games/${gameId}`);
            onValue(gameRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    setBoardSize(data.boardSize);
                    setStatus(data.status);
                    setMode(data.mode);
                    setBoard(convertSparseObjectTo2DArray(data.board, boardSize));
                    setCurrentPlayer(data.currentPlayer);
                    setMessage(data.message);
                    setIsGameActive(data.isGameActive);
                    setHasGameStarted(data.hasGameStarted);
                    setTimer(data.timer);
                    setBlackTime(data.blackTime);
                    setWhiteTime(data.whiteTime);
                    setBlockModeActive(data.blockModeActive);
                    setBlockedPlayer(data.blockedPlayer);
                    setMatch(game.fromData(data.boardSize, data.mode, data.board, data.currentPlayer, data.players));

                    if (!data.isGameActive) {
                        setRematchFriend(friendToPlay);
                    }
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

                let gameIds = new Set();
        
                const unsubscribe = onSnapshot(userDoc, async (doc) => {
                    const userData = doc.data();
                    const gameRequests = userData.gameRequests;

                    // Update gameIds with gameRequests
                    const requestIds = gameRequests.map(obj => obj.gameId);
                    gameIds.forEach(id => {
                        if (!requestIds.includes(id)) {
                            gameIds.delete(id);
                        }
                    })
                    if (Array.isArray(gameRequests)) {
                        gameRequests.forEach(request => {
                            // Only create toast if gameId has not been done before
                            if (!gameIds.has(request.gameId)) {
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
                                });
                                gameIds.add(request.gameId);
                            }
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
        if (!isGameActive) {
            setRematchFriend(friendToPlay);
            localStorage.removeItem('friendToPlay');
            setFriendToPlay('');
        }
    }, [isGameActive])

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
        if ((mode != 'block' && currentPlayer == 'Black') || (mode == 'block' && status == 'online' && blockedPlayer == 'Black') 
        || (mode == 'block' && status == 'local' && currentPlayer == 'Black')) {
            blackIntervalId = setInterval(() => {
                setBlackTime(prev => {
                    let currTime = Math.max(prev - 1, -1);
                    if ((status == "local" && currTime == 0) || (status == 'online' && currTime == -1)) {
                        const text = `${currentPlayer} has run out of time, ${match.getOpponent()} wins!`;
                        setMessage(text);
                        setIsGameActive(false);
                        updateGameState({message: text, isGameActive: false});
                        setRematchFriend(friendToPlay);
                        localStorage.removeItem('friendToPlay');
                        setFriendToPlay('');
                        clearInterval(blackIntervalId);
                    }
                    return currTime;
                }); 
            }, 1000);
        } else {
            whiteIntervalId = setInterval(() => {
                setWhiteTime(prev => {
                    let currTime = Math.max(prev - 1, -1);
                    if ((status == "local" && currTime == 0) || (status == 'online' && currTime == -1)) {
                        const text = `${currentPlayer} has run out of time, ${match.getOpponent()} wins!`;
                        setMessage(text);
                        setIsGameActive(false);
                        updateGameState({message: text, isGameActive: false});
                        setRematchFriend(friendToPlay);
                        localStorage.removeItem('friendToPlay');
                        setFriendToPlay('');
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
    }, [isGameActive, currentPlayer, blockedPlayer]);

    useEffect(() => {
        if (gameId) {
            const id = setInterval(() => {
                updateGameState({
                    blackTime: blackTime,
                    whiteTime: whiteTime
                })
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
            if (!friendToPlay) {
                setUserColor('Black');
                setFriendToPlay(rematchFriend);
                await AddGameRequest(username, rematchFriend, gameId);
                alert(`Invitation sent to ${rematchFriend}`);
            } else {
                await AddGameRequest(username, friendToPlay, gameId);
                alert(`Invitation sent to ${friendToPlay}`);
            }
            
        } catch (error) {
            console.log(error.message);
        }
    }

    const declineGame = async (request, toastId) => {
        try {
            await DeclineGameRequest(request, username);
            toast.dismiss(toastId);
            localStorage.removeItem('friendToPlay');
            setFriendToPlay('');
        } catch (error) {
            console.log(error.message);
        }
    }

    const createGame = () => {
        return createNewGame(boardSize, username, mode, setMode, setStatus, setGameId, setMatch, setBoard, setBoardSize, setCurrentPlayer, setMessage, setIsGameActive, setHasGameStarted, timer, setBlackTime, setWhiteTime, setBlockModeActive, setBlockedPlayer, blockModeActive, blockedPlayer);
    };

    const joinCurrentGame = (gameId, request, toastId) => {
        joinGame(mode, gameId, username, setGameId, setUserColor);
        setFriendToPlay(request.username);
        removeRequest(request, toastId, username);
    };

    const removeRequest = async (request, toastId, username) => {
        await RemoveGameRequest(request, username);
        toast.dismiss(toastId);
    }

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
        setMode(mode); //May not need
        let newGame = new game(size, mode);
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
            if (message.endsWith('skipped.')) {
                setMessage('');
                updateGameState({
                    message: ''
                })
            } else {
                setMessage(message);
            }
        }
    }

    function handleCellClick(rowIndex, colIndex) {
        if (!hasGameStarted) {
            setHasGameStarted(true);
            updateGameState({ hasGameStarted: true });
        }

        // If we are currently in state to choose which square to block
        if (blockModeActive) {
            // check if move is valid
            if (match.isValidMove(rowIndex, colIndex)) {
                if (gameId) {
                    match.blockCell(rowIndex, colIndex);
                    setBlockModeActive(false); // Exit block mode after setting cell
                    setAvailableCellsToBlock(null);
                    const text = `${blockedPlayer} blocked a cell. Now it's ${match.currentPlayer}'s turn.`
                    setMessage(text);
                    setBlockedPlayer(match.currentPlayer); // Current player now swapped to opponent
                    if (gameId) {
                        updateGameState({
                            board: match.board,
                            message: text,
                            blockedPlayer: match.currentPlayer,
                            blockModeActive: false
                        })
                    }
                } else {
                    match.blockCell(rowIndex, colIndex);
                    setBlockModeActive(false); // Exit block mode after setting cell
                    setAvailableCellsToBlock(null);
                    const text = `${currentPlayer} blocked a cell. Now it's ${match.currentPlayer}'s turn.`
                    setMessage(text);
                    setCurrentPlayer(match.currentPlayer); //Current player now swapped to opponent
                }
            }
                
        } else {
            if (gameId) {
                if (isGameActive && match.isValidMove(rowIndex, colIndex) && currentPlayer == userColor) {
                    if (mode == 'block') {
                        match.makeMove(rowIndex, colIndex); //Current player internally swapped
                        setBoard(match.board);
                        setBlockedPlayer(currentPlayer);
                        setCurrentPlayer(match.currentPlayer);
                        updateGameState({
                            board: match.board,
                            currentPlayer: match.currentPlayer,
                            blockedPlayer: currentPlayer,
                        })
                        
                        // Handle condition when skip turn
                        if (blockedPlayer != match.currentPlayer) {
                            // No need to set CurrentPlayer state yet as it is still user's turn, to block a cell
                            const validMoves = match.getValidMoves(match.currentPlayer);
                            // if opponent has only 1 validmove, do not enter block mode
                            if (validMoves.length > 1) {
                                setBlockModeActive(true); // User enters state to block move
                                setAvailableCellsToBlock(validMoves); // All moves that user can block
                                setMessage(`Select a cell to block for ${match.currentPlayer}`);
                                updateGameState({
                                    message: `Select a cell to block for ${match.currentPlayer}`,
                                    blockModeActive: true
                                })
                            }
                        }
                    } else {
                        match.makeMove(rowIndex, colIndex);
                        setBoard(match.board);
                        setCurrentPlayer(match.currentPlayer); // current player has internally swapped within makeMove
                        setMatch(match);
                        updateGameState({
                            board: match.board,
                            currentPlayer: match.currentPlayer,
                            match: match
                        });
                    }
                }
            } else {
                if (isGameActive && match.isValidMove(rowIndex, colIndex)) {
                    if (mode == 'block') {
                        match.makeMove(rowIndex, colIndex); //Current player internally swapped
                        setBoard(match.board);
                        // Handle condition when skip turn
                        if (currentPlayer != match.currentPlayer) {
                            // No need to set CurrentPlayer state yet as it is still user's turn, to block a cell
                            const validMoves = match.getValidMoves(match.currentPlayer);
                            // if opponent has only 1 validmove, do not enter block mode
                            if (validMoves.length > 1) {
                                setBlockModeActive(true); // User enters state to block move
                                setAvailableCellsToBlock(validMoves); // All moves that user can block
                                setMessage(`Select a cell to block for ${match.currentPlayer}`);
                            }
                        }
                    } else {
                        match.makeMove(rowIndex, colIndex);
                        setBoard(match.board);
                        setCurrentPlayer(match.currentPlayer); // current player has internally swapped within makeMove
                    }
                }
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
            setBlockModeActive(false);
            setAvailableCellsToBlock(null);
        }
    }

    function formatTime(seconds) {
        let minutes = Math.floor(seconds / 60);
        let second = seconds % 60;
        if (seconds == -1) {
            minutes = 0
            second = 0
        }
        return `${minutes}:${second < 10 ? `0${second}` : `${second}`}`;
    }

    function opponentColor(userColor) {
        return userColor == "Black" ? "White" : "Black";
    }

    const handleModeChange = (mode) => {
        setMode(mode);
        let newGame;
        // Reset game state or apply specific logic based on the selected mode
        if (mode == 'standard') {
            newGame = new game(boardSize);
        } else if (mode == 'reverse') {
            newGame = new game(boardSize, 'reverse');
        } else if (mode == 'random') {
            newGame = new game(boardSize, 'random');
        } else if (mode == 'block') {
            newGame = new game(boardSize, 'block');
            setBlockModeActive(false);
            setAvailableCellsToBlock(null);
        }
        setMatch(newGame);
        setBoard(newGame.board);
        setCurrentPlayer(newGame.currentPlayer);
        setMessage("");
        setIsGameActive(true);
        setHasGameStarted(false);
        setTimer(timer);
        setBlackTime(timer);
        setWhiteTime(timer);
    };

    return (
        <div className={styles.body}>
            <div className={styles.enclosingContainer}>
                <div className={styles.gameNameTimer}>
                    <div className={styles.playerTurn}>
                        {isGameActive && ((mode == 'block' && status == 'local') || mode != 'block') && <p style={{fontFamily: "fantasy", fontSize: "1.5rem", color: currentPlayer == "Black" ? "black": "white"}}>{currentPlayer} turn
                        </p>}
                        {hasGameStarted && isGameActive && (mode == 'block' && status == 'online') && <p style={{fontFamily: "fantasy", fontSize: "1.5rem", color: blockedPlayer == "Black" ? "black": "white"}}>{blockedPlayer} turn</p>}
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
                                    {cell == 'Blocked' && <img className={styles.image} src="cross.png" alt="Red cross" />}
                                    {gameId
                                    ? ((blockModeActive && (blockedPlayer == userColor)) || (!blockModeActive && (currentPlayer == userColor))) && match.isValidMove(rowIndex, colIndex) && <div className={styles.validMoveIndicator}></div>
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
                    <div className={styles.modeSelection}>
                    <div style={{color: "black", paddingBottom: "2px"}}>Select a different variant!</div>
                        <div className={styles.modeButton}>
                            {hasGameStarted 
                            ? <button onClick={() => handleModeChange('standard')} disabled>Standard Reversi</button>
                            : <button onClick={() => handleModeChange('standard')}>Standard Reversi</button>}
                            {hasGameStarted 
                            ? <button onClick={() => handleModeChange('reverse')} disabled>Reverse Reversi</button>
                            : <button onClick={() => handleModeChange('reverse')}>Reverse Reversi</button>}
                            {hasGameStarted 
                            ? <button onClick={() => handleModeChange('random')} disabled>Random Reversi</button>
                            : <button onClick={() => handleModeChange('random')}>Random Reversi</button>}
                            {hasGameStarted 
                            ? <button onClick={() => handleModeChange('block')} disabled>Obstruction Reversi</button>
                            : <button onClick={() => handleModeChange('block')}>Obstruction Reversi</button>}
                        </div>
                    </div>
                    {!hasGameStarted && friendToPlay && userColor == 'Black' && <div className={styles.startGame}>
                        <div style={{color: "black", paddingBottom: "2px"}}>Start an online game!</div>
                        {<button onClick={handleSendInvitation}>Start</button>}
                    </div>}
                </div>
            </div>
            {message && <div className={styles.message}>{message}</div>}
            {!isGameActive && status == "local" && <button onClick={restartGame} className={styles.restartButton}>Restart game!</button>}
            {!isGameActive && status == "online" && <button onClick={handleSendInvitation} className={styles.restartButton}>Rematch!</button>}
        </div>
    );
};

export default Reversi;
