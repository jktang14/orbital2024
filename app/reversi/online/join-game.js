import { realtimeDatabase } from "@/app/firebase";
import { ref, get, update } from "firebase/database";

export const createGame = async (gameId, playerId) => {
    // Get the game in the database with the respective gameId
    const gameRef = ref(realtimeDatabase, `games/${gameId}`)
    const gameSnapshot = await get(gameRef);

    // Check if this game exists
    if (gameSnapshot.exists()) {
        const gameData = gameSnapshot.val();

        // Check if game selected has less than 2 players
        if (Object.keys(gameData.players).length < 2) {
            // Assign color to player joining
            const playerColor = gameData[Object.keys(gameData.players)[0]] == "Black" ? "White" : "Black";
            // Add player to players object
            gameData.players[playerId] = playerColor;
            
            // Update players object in game
            await update(gameRef,  {
                players: gameData.players
            })
        }
    } else {
        throw new error("Game not found");
    }
}