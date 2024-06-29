import { realtimeDatabase } from "@/app/firebase";
import game from "../game-logic";
import { ref, push, set } from "firebase/database";

const createNewGame = (boardSize, username, mode, setMode, setStatus, setGameId, setMatch, setBoard, setBoardSize, setCurrentPlayer, setMessage, setIsGameActive, setHasGameStarted, timer, setBlackTime, setWhiteTime, blockModeActive, blockedPlayer) => {
    const newGameRef = ref(realtimeDatabase, 'games');
    const newGameKey = push(newGameRef).key;

    setGameId(newGameKey);
    
    const newMatch = new game(boardSize, mode);
    newMatch.players = {black: {name: username, color: "Black"}};

    const serializedMatch = {
        boardSize: newMatch.size,
        mode: newMatch.mode,
        board: newMatch.board,
        currentPlayer: newMatch.currentPlayer,
        players: newMatch.players
    };

    set(ref(realtimeDatabase, `games/${newGameKey}`), {
        match: serializedMatch,
        status: "online",
        board: newMatch.board,
        mode: mode,
        boardSize: boardSize,
        currentPlayer: newMatch.currentPlayer,
        players: {black: {name: username, color: "Black"}},
        message: "",
        isGameActive: true,
        hasGameStarted: false,
        timer: timer,
        blackTime: timer,
        whiteTime: timer,
        blockModeActive,
        blockedPlayer: blockedPlayer
    });

    setMatch(newMatch);
    setStatus('online');
    setMode(mode);
    setBoard(newMatch.board);
    setBoardSize(boardSize);
    setCurrentPlayer(newMatch.currentPlayer);
    setMessage("");
    setIsGameActive(true);
    setHasGameStarted(false);
    setBlackTime(timer);
    setWhiteTime(timer);

    return newGameKey;
};

export default createNewGame;