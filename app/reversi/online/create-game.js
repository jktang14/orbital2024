import { realtimeDatabase } from "@/app/firebase";
import game from "../game-logic";
import { ref, push, set } from "firebase/database";

const createNewGame = (boardSize, username, setStatus, setGameId, setMatch, setBoard, setBoardSize, setCurrentPlayer, setMessage, setIsGameActive, setHasGameStarted, timer, setBlackTime, setWhiteTime) => {
    const newGameRef = ref(realtimeDatabase, 'games');
    const newGameKey = push(newGameRef).key;

    setGameId(newGameKey);
    
    const newMatch = new game(boardSize);
    newMatch.players = {black: {name: username, color: "Black"}};

    set(ref(realtimeDatabase, `games/${newGameKey}`), {
        match: newMatch,
        status: "online",
        board: newMatch.board,
        boardSize: boardSize,
        currentPlayer: newMatch.currentPlayer,
        players: {black: {name: username, color: "Black"}},
        message: "",
        isGameActive: true,
        hasGameStarted: false,
        timer: timer,
        blackTime: timer,
        whiteTime: timer
    });

    setMatch(newMatch);
    setStatus('online');
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