import { db } from "../firebase";
import { query, collection, where, getDocs, updateDoc, doc, arrayUnion} from "firebase/firestore";

export const InviteFriend = async (username, friendName) => {
    const q = query(collection(db, 'users'), where('username', '==', friendName));
    const querySnapshot = await getDocs(q);

    // if username to invite does not exist
    if (querySnapshot.empty) {
        throw new Error('User not found');
    }

    let friendId = querySnapshot.docs[0].id;

    // Add user to friend request array
    const friendRef = doc(db, 'users', friendId);
    await updateDoc(friendRef, {
        friendRequests: arrayUnion(username)
    })
}