import { db } from "../firebase";
import { query, collection, where, getDocs, updateDoc, doc, arrayRemove} from "firebase/firestore";

const GetPlayerRating = async (username) => {
    const q = query(collection(db, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs[0].data().rating;
}

export default GetPlayerRating;