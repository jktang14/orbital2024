import { db } from "../firebase";
import { query, collection, where, getDocs, updateDoc, doc, arrayRemove} from "firebase/firestore";

export const DeclineGameRequest = async (request, friendName) => {
    // Check if friendName exists in database
    const q = query(collection(db, 'users'), where('username', '==', friendName));
    const querySnapshot = await getDocs(q);

    // if username does not exist
    if (querySnapshot.empty) {
        throw new Error('User not found');
    }

    let friendId = querySnapshot.docs[0].id;
    const friendRef = doc(db, 'users', friendId);

    await updateDoc(friendRef, {
        gameRequests: arrayRemove(request)
    })
}