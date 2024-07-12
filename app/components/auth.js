import { createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, query, doc, setDoc, getDoc, getDocs, where} from 'firebase/firestore';
import { auth, db, realtimeDatabase} from '../firebase';
import { ref, set, get, update } from "firebase/database";

// User sign up with email, password and username
export const SignUpUser = async (email, password, username) => {
    // Check if username exists
    const q = query(collection(db, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(q);
    
    // username exists in query
    if (!querySnapshot.empty) {
        throw new Error('username-already-exists');
    }

    let userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // User signed up
    let user = userCredential.user;

    // send verification link to user
    await sendEmailVerification(user);

    // Add a new document to 'users' collection
    // Each userid has property username, friends array, friendRequests array
    await setDoc(doc(db, 'users', user.uid), { 
        username: username,
        friends: [],
        friendRequests: [],
        gameRequests: [],
        rating: 500
    });

    await signOut(auth);

    return user;
};

// Login current user
export const LoginUser = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
  
    // Get username
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const username = userDoc.data().username;

    let userRef;
    // Add user to realtime database if email has been verified
    if (user.emailVerified) {
        userRef = ref(realtimeDatabase, 'users/' + user.uid)
        await set(userRef, {
            username: username,
            email: email,
            status: "online"
        });
    }
  
    return { user, username };
};