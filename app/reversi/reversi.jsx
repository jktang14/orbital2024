"use client";
import React, { useState, useEffect, useRef} from 'react';
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
import UpdateRating from '../components/updateRating';
import IsEqual from '../components/equal-board';
import DeepCopy from '../components/deep-copy';

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
    const [boardColor, setBoardColor] = useState('rgb(97, 136, 97)');
    const [blackPiece, setBlackPiece] = useState('black.png');
    const [whitePiece, setWhitePiece] = useState('white.png');
    const [ratingChange, setRatingChange] = useState({});
    const [isDropDownVisible, setIsDropDownVisible] = useState(false);
    
    const unsubscribeRef = useRef(null);
    const dropDownRef = useRef(null);
    const prevBoardRef = useRef();
    
    useEffect(() => {
        prevBoardRef.current = DeepCopy(board);
    }, [])

    useEffect(() => {
        if (gameId) {    
            const gameRef = ref(realtimeDatabase, `games/${gameId}`);
            const unSub = onValue(gameRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    setBoardSize(data.boardSize);
                    setStatus(data.status);
                    setMode(data.mode);
                    setBoard(convertSparseObjectTo2DArray(data.board, boardSize));
                    setCurrentPlayer(data.currentPlayer);
                    setMessage(data.message);
                    setIsGameActive(data.isGameActive);
                    setRatingChange(data.ratingChange)
                    setHasGameStarted(data.hasGameStarted);
                    setTimer(data.timer);
                    setBlackTime(data.blackTime);
                    setWhiteTime(data.whiteTime);
                    setBlockModeActive(data.blockModeActive);
                    setBlockedPlayer(data.blockedPlayer);
                    setMatch(game.fromData(data.boardSize, data.mode, data.board, data.currentPlayer, data.players));
                    if (!data.isGameActive) {
                        setGameId('');
                    }
                }
            });
            return () => {
                unSub();
            }
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

                unsubscribeRef.current = unsubscribe;
            }
        }
        handleGameRequests();

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        }
    }, [username])
    
    useEffect(() => {
        if (!IsEqual(prevBoardRef.current, board)) {
            checkStatus();
            prevBoardRef.current = DeepCopy(board);
        }
    }, [board]);

    useEffect(() => {
        // Check if window and localStorage are available
        if (typeof window !== 'undefined') {
            const friendToPlay = localStorage.getItem('friendToPlay');
            if (friendToPlay) {
                setFriendToPlay(friendToPlay);
            }
            const storedUsername = localStorage.getItem('username');
            if (storedUsername) {
                setUsername(storedUsername);
                match.players['black'].name = storedUsername;
            }
            const storedBoardColor = localStorage.getItem('boardColor');
            if (storedBoardColor) {
                setBoardColor(storedBoardColor);
            }
            const storedBlackPiece = localStorage.getItem('blackPiece');
            if (storedBlackPiece) {
                setBlackPiece(storedBlackPiece);
            }
            const storedWhitePiece = localStorage.getItem('whitePiece');
            if (storedWhitePiece) {
                setWhitePiece(storedWhitePiece);
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
        || (mode == 'block' && (status != 'online') && currentPlayer == 'Black')) {
            blackIntervalId = setInterval(() => {
                setBlackTime(prev => {
                    let currTime = Math.max(prev - 1, -1);
                    if ((status != "online" && currTime == 0) || (status == 'online' && currTime == -1)) {
                        const text = `${match.players[currentPlayer.toLowerCase()].name} has run out of time, ${match.players[match.getOpponent(match.currentPlayer).toLowerCase()].name} wins!`;
                        if (status == 'online') {
                            UpdateRating(match.players["white"].name, match.players["black"].name, 'white', 'black').then((obj) => {
                                setRatingChange(obj);
                                updateGameState({ratingChange: obj});
                            });
                        }
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
                    let currTime = Math.max(prev - 1, -1);
                    if ((status != "online" && currTime == 0) || (status == 'online' && currTime == -1)) {
                        const text = `${match.players[currentPlayer.toLowerCase()].name} has run out of time, ${match.players[match.getOpponent(match.currentPlayer).toLowerCase()].name} wins!`;
                        if (status == 'online') {
                            UpdateRating(match.players["black"].name, match.players["white"].name, "black", "white").then((obj) => {
                                setRatingChange(obj);
                                updateGameState({ratingChange: obj});
                            })
                        }
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
        return createNewGame(boardSize, username, mode, setMode, setStatus, setGameId, setMatch, setBoard, setBoardSize, setCurrentPlayer, setMessage, setIsGameActive, setHasGameStarted, timer, setBlackTime, setWhiteTime, setBlockModeActive, setBlockedPlayer, setRatingChange);
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
        newGame.players = match.players;
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
            const text = `${match.players[result.winner.toLowerCase()].name} wins!`;
            if (status == 'online') {
                UpdateRating(match.players[result.winner.toLowerCase()].name, match.players[result.winner == 'Black' ? 
                    'white' : 'black'].name, result.winner.toLowerCase(), result.winner == 'Black' ? 
                    'white' : 'black').then((obj) => {
                        setRatingChange(obj);
                        updateGameState({ratingChange: obj});
                    });
            }
            setMessage(text);
            setIsGameActive(false);
            updateGameState({
                message: text,
                isGameActive: false
            });
        } else if (result.status == 'draw') {
            const text = 'The game is a draw!';
            if (status == 'online') {
                UpdateRating(match.players[result.winner.toLowerCase()].name, match.players[result.winner == 'Black' ? 
                    'white' : 'black'].name, result.winner.toLowerCase(), result.winner == 'Black' ? 
                    'white' : 'black', 'draw').then((obj) => {
                        setRatingChange(obj);
                        updateGameState({ratingChange: obj});
                    });
            }
            setMessage(text);
            setIsGameActive(false);
            updateGameState({
                message: text,
                isGameActive: false
            });
        } else if (result.status == 'skip') {
            console.log("skipped")
            setMessage(result.message);
            setCurrentPlayer(match.currentPlayer);
            // Case where user has no moves and is AI's turn
            if ((status == 'easyAI' || status == 'hardAI') && match.currentPlayer == "White") {
                setTimeout(() => {
                    match.aiMove(mode, status, setBoard, setCurrentPlayer, blockModeActive, setBlockModeActive, setAvailableCellsToBlock, setMessage);
                }, 3000);
            }
            if (mode == 'block') {
                setBlockedPlayer(match.currentPlayer);
            }
            updateGameState({
                message: result.message,
                currentPlayer: match.currentPlayer,
                blockedPlayer: match.currentPlayer
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

    const handleOnlineAndBlockMode = (rowIndex, colIndex) => {
        match.blockCell(rowIndex, colIndex, match.board);
        setBoard(match.board);
        setBlockModeActive(false); // Exit block mode after setting cell
        setAvailableCellsToBlock(null);
        const text = `${match.players[blockedPlayer.toLowerCase()].name} blocked a cell. Now it's ${match.players[match.currentPlayer.toLowerCase()].name}'s turn.`
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
    }

    const handleOnlineAndNotBlockMode = (rowIndex, colIndex) => {
        if (isGameActive && match.isValidMove(rowIndex, colIndex, match.currentPlayer, match.board) && currentPlayer == userColor) {
            // online game and is blocked reversi
            if (mode == 'block') {
                match.makeMove(status, rowIndex, colIndex, match.currentPlayer, match.board); //Current player internally swapped
                setBoard(match.board);
                const text = `${match.players[currentPlayer.toLowerCase()].name} is blocking a cell`;
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
                    const validMoves = match.getValidMoves(match.currentPlayer, match.board);
                    // if opponent has only 1 validmove, do not enter block mode
                    if (validMoves.length > 1) {
                        setBlockModeActive(true); // User enters state to block move
                        setAvailableCellsToBlock(validMoves); // All moves that user can block
                        setMessage(text);
                        updateGameState({
                            message: text,
                            blockModeActive: true
                        })
                    } else {
                        setMessage(`${match.players[match.currentPlayer.toLowerCase()].name} has only 1 valid move, ${match.players[match.currentPlayer.toLowerCase()].name}'s turn`);
                        setCurrentPlayer(match.currentPlayer);
                        setBlockedPlayer(match.currentPlayer);
                        updateGameState({
                            message: `${match.players[match.currentPlayer.toLowerCase()].name} has only 1 valid move, ${match.players[match.currentPlayer.toLowerCase()].name}'s turn`,
                            currentPlayer: match.currentPlayer,
                            blockedPlayer: match.currentPlayer
                        })
                    }
                }
            } else {
                // online game but not block reversi
                match.makeMove(status, rowIndex, colIndex, match.currentPlayer, match.board);
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
    }

    function handleCellClick(rowIndex, colIndex) {
        if (!hasGameStarted) {
            setHasGameStarted(true);
            updateGameState({ hasGameStarted: true });
        }

        // If we are currently in state to choose which square to block
        if (blockModeActive) {
            // check if move is valid
            if (match.isValidMove(rowIndex, colIndex, match.currentPlayer, match.board)) {
                // In blocked mode and online game
                if (gameId) {
                    handleOnlineAndBlockMode(rowIndex, colIndex);
                } else {
                    // In blocked mode but local game
                    if (status == 'local' || ((status == 'easyAI' || status == 'hardAI') && match.currentPlayer == "White")) {
                        match.blockCell(rowIndex, colIndex, match.board);
                        setBoard(match.board);
                        setBlockModeActive(false); // Exit block mode after setting cell
                        setAvailableCellsToBlock(null);
                        const text = `${match.players[currentPlayer.toLowerCase()].name} blocked a cell. Now it's ${match.players[match.currentPlayer.toLowerCase()].name }'s turn.`
                        setMessage(text);
                        setCurrentPlayer(match.currentPlayer); // Current player now swapped to opponent
    
                        // Against easy AI and in block mode
                        if (status == "easyAI" || status == 'hardAI') {
                            setTimeout(() => {
                                console.log("switch to ai turn")
                                match.aiMove(mode, status, setBoard, setCurrentPlayer, false, setBlockModeActive, setAvailableCellsToBlock, setMessage);
                            }, 3000);
                        }
                    }
                }
            }
        } else {
            // Not in blocked mode
            if (gameId) {
                // Not in blocked mode and online game
                handleOnlineAndNotBlockMode(rowIndex, colIndex);
            } else {
                // Not in blocked mode and is local
                if (isGameActive && match.isValidMove(rowIndex, colIndex, match.currentPlayer, match.board)) {
                    // local and block mode
                    if (mode == 'block') {
                        // Additional condition so that user cannot click during ai's move
                        if (status == 'easyAI' || status == 'hardAI') {
                            if (match.currentPlayer == 'Black') {
                                match.makeMove(status, rowIndex, colIndex, match.currentPlayer, match.board); //Current player internally swapped
                                setBoard(match.board);
                                // No need to set CurrentPlayer state yet as it is still user's turn, to block a cell
                                const validMoves = match.getValidMoves(match.currentPlayer, match.board);
                                // if opponent has only 1 validmove, do not enter block mode
                                if (validMoves.length > 1) {
                                    setBlockModeActive(true); // User enters state to block move
                                    setAvailableCellsToBlock(validMoves); // All moves that user can block
                                    setMessage(`${match.players[currentPlayer.toLowerCase()].name} is blocking a cell`);
                                } else {
                                    if (validMoves.length == 1) {
                                        setCurrentPlayer(match.currentPlayer);
                                    }
                                    setMessage(`${match.players[match.currentPlayer.toLowerCase()].name} has only 1 valid move, ${match.players[match.currentPlayer.toLowerCase()].name}'s turn`);
                                    setTimeout(() => {
                                        // match.currentPlayer should be White here in normal circumstances, if Black, ai has no moves
                                        if (match.currentPlayer != userColor) {
                                            match.aiMove(mode, status, setBoard, setCurrentPlayer, false, setBlockModeActive, setAvailableCellsToBlock, setMessage);
                                        }
                                    }, 3000);
                                }
                            }
                        } else {
                            match.makeMove(status, rowIndex, colIndex, match.currentPlayer, match.board); //Current player internally swapped
                            setBoard(match.board);
                            // Handle condition when skip turn
                            if (currentPlayer != match.currentPlayer) {
                                // No need to set CurrentPlayer state yet as it is still user's turn, to block a cell
                                const validMoves = match.getValidMoves(match.currentPlayer, match.board);
                                // if opponent has only 1 validmove, do not enter block mode
                                if (validMoves.length > 1) {
                                    setBlockModeActive(true); // User enters state to block move
                                    setAvailableCellsToBlock(validMoves); // All moves that user can block
                                    setMessage(`${match.players[currentPlayer.toLowerCase()].name} is blocking a cell`);
                                } else {
                                    setCurrentPlayer(match.currentPlayer);
                                    setMessage(`${match.players[match.currentPlayer.toLowerCase()].name} has only 1 valid move, ${match.players[match.currentPlayer.toLowerCase()].name}'s turn`);
                                }
                            }
                        }
                    } else {
                        // local but not block mode
                        // Against easyAI
                        if (status == "easyAI" || status == "hardAI") {
                            // Only can move if user's turn
                            console.log("entered");
                            if (currentPlayer == userColor) {
                                match.makeMove(status, rowIndex, colIndex, match.currentPlayer, match.board);
                                setBoard(match.board);
                                setCurrentPlayer(match.currentPlayer); // current player has internally swapped within makeMove
                                setTimeout(() => {
                                    // match.currentPlayer should be White here in normal circumstances, if Black, ai has no moves
                                    console.log(match.currentPlayer);
                                    if (match.currentPlayer != userColor) {
                                        match.aiMove(mode, status, setBoard, setCurrentPlayer, false, setBlockModeActive, setAvailableCellsToBlock, setMessage);
                                    }
                                }, 3000);
                            }
                        } else {
                            // Not against easy AI
                            match.makeMove(status, rowIndex, colIndex, match.currentPlayer, match.board);
                            setBoard(match.board);
                            setCurrentPlayer(match.currentPlayer); // current player has internally swapped within makeMove
                        }
                    }
                }
            }
        }
    }

    function restartGame(status) {
        let newGame = new game(boardSize, mode);
        setBoardSize(boardSize);
        setMatch(newGame);
        setBoard(newGame.board);
        setCurrentPlayer(newGame.currentPlayer);
        setMessage("");
        setIsGameActive(true);
        setHasGameStarted(false);
        if (status == "easyAI" || status == "hardAI") {
            newGame.players['white'].name = "Computer";
        }
        newGame.players['black'].name = username;
        const newTimer = 300;
        setTimer(newTimer);
        setBlackTime(newTimer);
        setWhiteTime(newTimer);
        setBlockModeActive(false);
        setAvailableCellsToBlock(null);
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
        // return userColor == "Black" ? "White" : "Black";
        return userColor == "Black" ? "white" : "black";
    }

    const handleStatusChange = (status) => {
        setStatus(status);
        restartGame(status);
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
        newGame.players = match.players;
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

    const toggleDropDown = () => {
        setIsDropDownVisible(!isDropDownVisible);
    };

    return (
        <div className={styles.body}>
            <div className={styles.enclosingContainer}>
                <div className={styles.gameNameTimer}>
                    <div className={styles.playerTurn}>
                        {hasGameStarted && isGameActive && ((mode == 'block' && status != 'online') || mode != 'block') && <p style={{fontFamily: "fantasy", fontSize: "1.3rem"}}>{match.players[currentPlayer.toLowerCase()].name} turn
                        </p>}
                        {hasGameStarted && isGameActive && blockedPlayer && (mode == 'block' && status == 'online') && <p style={{fontFamily: "fantasy", fontSize: "1.3rem"}}>{match.players[blockedPlayer.toLowerCase()].name} turn</p>}
                    </div>
                    <div className={styles.nameTimer}>
                        <div className={styles.nameRating}> 
                            {<p className= {styles.name}>{"white" in match.players && status == "online" ? `${match.players[opponentColor(userColor)].name} (${match.players[opponentColor(userColor)].rating})`: "Player 2"}</p>}
                            {("white" in match.players && status == "online" && !isGameActive) && 
                            <p style={{color: 'green', fontSize: "0.8rem"}}>{ratingChange[opponentColor(userColor)] >= 0 ? `+${ratingChange[opponentColor(userColor)]}` : ratingChange[opponentColor(userColor)]}</p>}
                        </div>
                        <div className={styles.timer}>
                            <p>{formatTime(userColor == "Black" ? whiteTime: blackTime)}</p>    
                        </div>
                    </div>
                    <div className={styles.container} style = {{gridTemplateRows: `repeat(${boardSize}, 1fr)`, backgroundColor: `${boardColor}`}}>
                        {match.board.map((row, rowIndex) => (
                            <div className={styles.row} key={rowIndex}>
                            {row.map((cell, colIndex) => (
                                <div className={styles.cell} key={colIndex} onClick={() => handleCellClick(rowIndex, colIndex)}>
                                    {cell == 'Black' && <img className={styles.image} src={blackPiece} alt="Black piece" />}
                                    {cell == 'White' && <img className={styles.image} src={whitePiece} alt="White piece" />}
                                    {cell == 'Blocked' && <img className={styles.image} src="cross.png" alt="Red cross" />}
                                    {gameId
                                    ? ((blockModeActive && (blockedPlayer == userColor)) || (!blockModeActive && (currentPlayer == userColor))) && match.isValidMove(rowIndex, colIndex, match.currentPlayer, match.board) && <div className={styles.validMoveIndicator}></div>
                                    : match.isValidMove(rowIndex, colIndex, match.currentPlayer, match.board) && (status == 'local' || currentPlayer == userColor) && <div className={styles.validMoveIndicator}></div>}
                                </div>
                            ))}
                            </div>
                        ))}
                    </div>
                    <div className={styles.nameTimer}>
                        <div className={styles.nameRating}>
                            <p className={styles.name}>{status == 'online' ? `${username} (${match.players[userColor == 'Black' ? 'black': 'white'].rating})` : username}</p>
                            {(status == "online" && !isGameActive) && 
                            <p style={{color: 'green', fontSize: "0.8rem"}}>{ratingChange[userColor.toLowerCase()] >= 0 ? `+${ratingChange[userColor.toLowerCase()]}` : ratingChange[userColor.toLowerCase()]}</p>}
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
                        <div className={styles.gridButtons}>
                            {hasGameStarted 
                            ? <button className={styles.gridButton} onClick={() => handleBoardSizeChange(6)} disabled>6x6</button>
                            : <button className={styles.gridButton} onClick={() => handleBoardSizeChange(6)}>6x6</button>}
                            {hasGameStarted 
                            ? <button className={styles.gridButton} onClick={() => handleBoardSizeChange(8)} disabled>8x8</button>
                            : <button className={styles.gridButton} onClick={() => handleBoardSizeChange(8)}>8x8</button>}
                            {hasGameStarted 
                            ? <button className={styles.gridButton} onClick={() => handleBoardSizeChange(10)} disabled>10x10</button>
                            : <button className={styles.gridButton} onClick={() => handleBoardSizeChange(10)}>10x10</button>}
                            {hasGameStarted 
                            ? <button className={styles.gridButton} onClick={() => handleBoardSizeChange(12)} disabled>12x12</button>
                            : <button className={styles.gridButton} onClick={() => handleBoardSizeChange(12)}>12x12</button>}
                        </div>
                    </div>
                    <div className={styles.modeSelection}>
                    <div style={{color: "black", paddingBottom: "2px"}}>Select a different variant!</div>
                        <div className={styles.modeButton}>
                            {hasGameStarted 
                            ?   <div className={styles.variantDescription}>
                                    <button className={styles.variantButton} onClick={() => handleModeChange('standard')} disabled>Standard Reversi</button>
                                    <p style={{textAlign: "center", fontSize:"11px", color: "white"}}>Enjoy a standard game of reversi!</p>
                                </div>
                            :    <div className={styles.variantDescription}>
                                    <button className={styles.variantButton} onClick={() => handleModeChange('standard')} >Standard Reversi</button>
                                    <p style={{textAlign: "center", fontSize:"11px", color: "white"}}>Enjoy a standard game of reversi!</p>
                                </div>}
                            {hasGameStarted 
                            ?   <div className={styles.variantDescription}>
                                    <button className={styles.variantButton} onClick={() => handleModeChange('reverse')} disabled>Reverse Reversi</button>
                                    <p style={{textAlign: "center", fontSize:"11px", color: "white"}}>Win by having fewer pieces on the board!</p>
                                </div>
                            :   <div className={styles.variantDescription}>
                                    <button className={styles.variantButton} onClick={() => handleModeChange('reverse')} >Reverse Reversi</button>
                                    <p style={{textAlign: "center", fontSize:"11px", color: "white"}}>Win by having fewer pieces on the board!</p>
                                </div>}
                            {hasGameStarted 
                            ?   <div className={styles.variantDescription}> 
                                    <button className={styles.variantButton} onClick={() => handleModeChange('random')} disabled>Random Reversi</button>
                                    <p style={{textAlign: "center", fontSize:"11px", color: "white"}}>Play different starting configurations!</p>
                                </div>
                            :   <div className={styles.variantDescription}> 
                                    <button className={styles.variantButton} onClick={() => handleModeChange('random')}>Random Reversi</button>
                                    <p style={{textAlign: "center", fontSize:"11px", color: "white"}}>Play different starting configurations!</p>
                                </div>}
                            {hasGameStarted 
                            ?  <div className={styles.variantDescription}> 
                                    <button className={styles.variantButton} onClick={() => handleModeChange('block')} disabled>Obstruction Reversi</button>
                                    <p style={{textAlign: "center", fontSize:"11px", color: "white"}}>Block your opponents move!</p>
                                </div>
                            :   <div className={styles.variantDescription}> 
                                    <button className={styles.variantButton} onClick={() => handleModeChange('block')} >Obstruction Reversi</button>
                                    <p style={{textAlign: "center", fontSize:"11px", color: "white"}}>Block your opponents move!</p>
                                </div>}
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.gameSelectors}>
                <div className={styles.messageContainer}>
                    Game message:
                    <div className={styles.message}>
                        {message && <div>{message}</div>}
                    </div>
                </div>
                <div className={styles.gameStatus}>
                    <button className={styles.localButton} onClick={() => handleStatusChange('local')}>Local multiplayer</button>
                    <div className={styles.dropDown} ref={dropDownRef}>
                        <button className={styles.computerButton} onClick={toggleDropDown}>Play against the computer</button>
                        {isDropDownVisible && <div className={styles.dropDownMenu}>
                            <button className={styles.easyButton} onClick={() => handleStatusChange('easyAI')}>Easy</button>
                            <button className={styles.hardButton} onClick={() => handleStatusChange('hardAI')}>Hard</button>
                        </div>}
                    </div>
                    {!hasGameStarted && friendToPlay && userColor == 'Black' && <div className={styles.startGame}>
                        {<button className={styles.onlineGame} onClick={handleSendInvitation}>Play your friend!</button>}
                    </div>}
                    <div className={styles.restartButtons}>
                        {!isGameActive && status == "local" && <button onClick={() => restartGame('local')} className={styles.restartButton}>Restart game!</button>}
                        {!isGameActive && status == "online" && <button onClick={handleSendInvitation} className={styles.restartButton}>Rematch!</button>}
                    </div>
                </div>
                
            </div>
        </div>
    );
};

export default Reversi;
