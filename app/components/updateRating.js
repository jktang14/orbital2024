import { db } from "../firebase";
import { query, collection, where, getDocs, updateDoc, doc} from "firebase/firestore";

const UpdateRating = async (winnerName, loserName, player1Color, player2Color, status="win") => {
    const winnerQuery = query(collection(db, 'users'), where('username', '==', winnerName));
    const loserQuery = query(collection(db, 'users'), where('username', '==', loserName));
    const winnerSnapshot = await getDocs(winnerQuery);
    const loserSnapshot = await getDocs(loserQuery);

    const originalWinnerRating = winnerSnapshot.docs[0].data().rating;
    const originalLoserRating = loserSnapshot.docs[0].data().rating;
    const winnerExpectedProb = 1 / (1 + Math.pow(10, (originalLoserRating - originalWinnerRating) / 400));
    const loserExpectedProb = 1 / (1 + Math.pow(10, (originalWinnerRating - originalLoserRating) / 400));
    let newWinnerRating;
    let newLoserRating;
    let winnerRatingChange;
    let loserRatingChange;

    if (status == "win") {
        winnerRatingChange = Math.floor(14 * (1 - winnerExpectedProb));
        loserRatingChange = Math.ceil(14 * (0 - loserExpectedProb));
        newWinnerRating = originalWinnerRating + winnerRatingChange;
        newLoserRating = originalLoserRating + loserRatingChange;
    } else if (status == "draw") {
        const winCalc = 14 * (0.5 - winnerExpectedProb);
        const loseCalc = 14 * (0.5 - loserExpectedProb);
        winnerRatingChange = winCalc < 0 ? Math.ceil(winCalc): Math.floor(winCalc);
        loserRatingChange = loseCalc < 0 ? Math.ceil(loseCalc): Math.floor(loseCalc);
        newWinnerRating = originalWinnerRating + winnerRatingChange;
        newLoserRating = originalLoserRating + loserRatingChange;
    }

    const winnerId = winnerSnapshot.docs[0].id;
    const winnerRef = doc(db, 'users', winnerId);
    const loserId = loserSnapshot.docs[0].id;
    const loserRef = doc(db, 'users', loserId);
    
    await updateDoc(winnerRef, {
        rating: newWinnerRating
    })

    await updateDoc(loserRef, {
        rating: newLoserRating
    })

    return {[player1Color]: winnerRatingChange, [player2Color]: loserRatingChange};
}

export default UpdateRating;