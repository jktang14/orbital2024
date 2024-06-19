import { realtimeDatabase } from "@/app/firebase";
import { ref, update, onValue} from "firebase/database";

const joinGame = (inputGameId, username, setGameId, setUserColor) => {
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

                // Set user color for second player
                setUserColor('White');

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

export default joinGame;