import { realtimeDatabase } from "@/app/firebase";
import { ref, push, set } from "firebase/database";
import game from "../game-logic";

export const createGame = async (playerId) => {
    // Get game id
    const gameId = push(ref(realtimeDatabase, 'games')).key;
    const gameRef = ref(realtimeDatabase, `games/${gameId}`);

    // Create new instance of a game
    const gameInstance = new game();

    await set(gameRef, {
        board : gameInstance.board,
        players: {playerId},
        moves : {}
    })
}