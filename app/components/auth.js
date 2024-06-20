import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, realtimeDatabase} from '../firebase';
import { onDisconnect, ref, set } from "firebase/database";

// User sign up with email, password and username
export const SignUpUser = async (email, password, username) => {
    let userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // User signed up
    let user = userCredential.user;

    // send verification link to user
    await sendEmailVerification(user);

    // Add a new document to 'users' collection
    await setDoc(doc(db, 'users', user.uid), { username });

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
            email: email
          });
        //onDisconnect(userRef).remove();
    }
  
    return { user, username };
};