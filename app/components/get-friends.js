import { db } from "../firebase";
import { query, collection, where, getDocs, updateDoc, doc, arrayRemove} from "firebase/firestore";
import { realtimeDatabase } from "../firebase";
import { ref, get } from "firebase/database";

export const GetFriends = async (username) => {
    // Get snapshot for current user
    const q = query(collection(db, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(q);

    const userDocs = querySnapshot.docs[0];
    const userData = userDocs.data();
    const friends = userData.friends;

    const friendStatusPromise = friends.map(async (friendName) => {
        const friendQuery = query(collection(db, 'users'), where('username', '==', friendName));
        const friendSnapshot = await getDocs(friendQuery);
        const rating = friendSnapshot.docs[0].data().rating;

        if (!friendSnapshot.empty) {
            // get user id
            const userId = friendSnapshot.docs[0].id;
            const gameRef = ref(realtimeDatabase, `users/${userId}`);
            const snapshot = await get(gameRef);
            return {username: friendName, status: snapshot.val().status, rating: rating}
        }
    });

    const friendStatuses = await Promise.all(friendStatusPromise);
    return friendStatuses;
}