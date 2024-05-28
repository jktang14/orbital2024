import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// User sign up with email, password and username
export const signUpUser = async (email, password, username) => {
    let userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // User signed up
    let user = userCredential.user;

    // Add a new document to 'users' collection
    await setDoc(doc(db, 'users', user.uid), { username });

    return user;
};

// Login current user
export const loginUser = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
  
    // Get username
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const username = userDoc.data().username;
  
    return { user, username };
};