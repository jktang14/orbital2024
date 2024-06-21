import { db } from "../firebase";
import { query, collection, where, getDocs, getDoc, updateDoc, doc, arrayUnion} from "firebase/firestore";

export const AddFriend = async (currentUserId, friendName) => {
    // Check if friendName exists in database
    const q = query(collection(db, 'users'), where('username', '==', friendName));
    const querySnapshot = await getDocs(q);

    // if username to add does not exist
    if (querySnapshot.empty) {
        throw new Error('User not found');
    }

    let friendId = querySnapshot.docs[0].id

    // Update current user friend array with new friend
    const userRef = doc(db, 'users', currentUserId);
    await updateDoc(userRef, {
        friends: arrayUnion(friendName)
    })

    // Get current user username
    const userDoc = await getDoc(userRef);
    const username = userDoc.data().username;

    // Update friend's friend array
    const friendRef = doc(db, 'users', friendId);
    await updateDoc(friendRef, {
        friends: arrayUnion(username)
    })
}