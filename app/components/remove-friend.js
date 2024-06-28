import { db } from "../firebase";
import { query, collection, where, getDocs, updateDoc, doc, arrayRemove} from "firebase/firestore";

export const RemoveFriend = async (username, friendName) => {
    // Check if friendName exists in database
    const q = query(collection(db, 'users'), where('username', '==', friendName));
    const querySnapshot = await getDocs(q);

    const userQuery = query(collection(db, 'users'), where('username', '==', username));
    const userSnapshot = await getDocs(userQuery);

    let friendId = querySnapshot.docs[0].id
    let currentUserId = userSnapshot.docs[0].id

    // Remove friend from current user friend array
    const userRef = doc(db, 'users', currentUserId);
    await updateDoc(userRef, {
        friends: arrayRemove(friendName)
    })

    // Remove user from friend's array
    const friendRef = doc(db, 'users', friendId);
    await updateDoc(friendRef, {
        friends: arrayRemove(username)
    })
}