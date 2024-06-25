import { db } from "../firebase";
import { query, collection, where, getDocs, updateDoc, doc, arrayUnion, arrayRemove} from "firebase/firestore";

export const AddFriend = async (username, friendName) => {
    // Check if friendName exists in database
    const q = query(collection(db, 'users'), where('username', '==', friendName));
    const querySnapshot = await getDocs(q);

    // if username to add does not exist
    if (querySnapshot.empty) {
        throw new Error('User not found');
    }

    const userQuery = query(collection(db, 'users'), where('username', '==', username));
    const userSnapshot = await getDocs(userQuery);

    let friendId = querySnapshot.docs[0].id
    let currentUserId = userSnapshot.docs[0].id

    // Update current user friend array with new friend
    const userRef = doc(db, 'users', currentUserId);
    await updateDoc(userRef, {
        friends: arrayUnion(friendName)
    })

    // Update friend's friend array
    const friendRef = doc(db, 'users', friendId);
    const friendRequestList = userSnapshot.docs[0].data().friendRequests;
    if (friendRequestList.length != 0) {
        await updateDoc(userRef, {
            friendRequests: arrayRemove(friendName)
        })
    }

    await updateDoc(friendRef, {
        friends: arrayUnion(username)
    })
}