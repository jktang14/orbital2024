import { db } from "../firebase";
import { query, collection, where, getDocs, updateDoc, doc} from "firebase/firestore";

const UpdateRating = async (winnerName, loserName) => {
    const winnerQuery = query(collection(db, 'users'), where('username', '==', winnerName));
    const loserQuery = query(collection(db, 'users'), where('username', '==', loserName));
    const winnerSnapshot = await getDocs(winnerQuery);
    const loserSnapshot = await getDocs(loserQuery);

    const originalWinnerRating = winnerSnapshot.docs[0].data().rating;
    const originalLoserRating = loserSnapshot.docs[0].data().rating;
    const newWinnerRating = originalWinnerRating + 10;
    const newLoserRating = originalLoserRating - 10;

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
}

export default UpdateRating;