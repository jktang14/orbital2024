'use client'
import {React, useEffect, useState} from "react";
import styles from './style.module.css';
import { db } from "../firebase";
import { query, collection, where, getDocs, updateDoc, doc, onSnapshot} from "firebase/firestore";
import { realtimeDatabase } from "../firebase";
import { GetFriends } from "../components/get-friends";

const FriendsList = () => {
    const [friends, setFriends] = useState([]);
    const [username, setUsername] = useState('');

    useEffect(() => {
        // Check if window and localStorage are available
        if (typeof window !== 'undefined') {
            const storedUsername = localStorage.getItem('username');
            if (storedUsername) {
                setUsername(storedUsername);
            }
        }
    }, []);

    // useEffect to check for updates in friends list
    useEffect(() => {
        const handleFriendsUpdates = async () => {
            console.log(username)
            if (username) {
                const q = query(collection(db, 'users'), where('username', '==', username));
                const querySnapshot = await getDocs(q);
    
                const userId = querySnapshot.docs[0].id;
                const userDoc = doc(db, 'users', userId);
    
                const unsubscribe = onSnapshot(userDoc, (doc) => {
                    const userData = doc.data();
                    setFriends(userData.friends)
                })
    
                return () => unsubscribe();
            } else {
                console.log("Error");
            }
        }
        handleFriendsUpdates();
    }, [username])

    //Each friend has 
    
    return (
        <div className={styles.body}>
            <div className={styles.friendsList}>
                <h1 style = {{margin: 0}}>Friends List</h1>
                {friends.map(friend => (
                    <li key = {friend} className={styles.listItem}>
                        {friend}
                    </li>
                ))}
            </div>
        </div>
    )
}

export default FriendsList;