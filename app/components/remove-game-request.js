import { db } from "../firebase";
import { query, collection, where, getDocs, updateDoc, doc, arrayRemove} from "firebase/firestore";

export const RemoveGameRequest = async (request, username) => {
    // Check if friendName exists in database
    const q = query(collection(db, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(q);

    // if username does not exist
    if (querySnapshot.empty) {
        throw new Error('User not found');
    }

    let userId = querySnapshot.docs[0].id;
    const userRef = doc(db, 'users', userId);

    await updateDoc(userRef, {
        gameRequests: arrayRemove(request)
    })
}