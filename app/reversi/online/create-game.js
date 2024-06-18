import { realtimeDatabase } from "@/app/firebase";
import game from "../game-logic";
import { ref, push, set } from "firebase/database";

const createNewGame = (boardSize, username, setGameId, setMatch, setBoard, setBoardSize, setCurrentPlayer, setMessage, setIsGameActive, setHasGameStarted, timer, setBlackTime, setWhiteTime) => {
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

export default createNewGame;