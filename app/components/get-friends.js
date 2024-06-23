import { db } from "../firebase";
import { query, collection, where, getDocs, updateDoc, doc, arrayRemove} from "firebase/firestore";

export const GetFriends = async (username) => {
    // Get snapshot for current user
    const q = query(collection(db, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(q);

    const userDocs = querySnapshot.docs[0];
    const userData = userDocs.data();
    const friends = userData.friends;

    return friends;
}