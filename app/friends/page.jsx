'use client'
import {React, useEffect, useState} from "react";
import styles from './style.module.css';
import { db } from "../firebase";
import { query, collection, where, getDocs, updateDoc, doc, onSnapshot} from "firebase/firestore";
import { realtimeDatabase } from "../firebase";
import { onValue, ref } from "firebase/database";
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

    //Check for status updates
    useEffect(() => {   
        const friendsStatusListener = friends.map(async friend => {
            const q = query(collection(db, 'users'), where('username', '==', friend.username));
            const querySnapshot = await getDocs(q);
            const userId = querySnapshot.docs[0].id;
            const onlineStatusRef = ref(realtimeDatabase, `users/${userId}`);
            return onValue(onlineStatusRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    setFriends(prevFriends => prevFriends.map(f => f.username == friend.username ? {username: f.username, status: data.status} : f))
                }
            })
        })

        return () => {
            friendsStatusListener.forEach(listener => off(listener));
        };
    }, [friends])
    
    return (
        <div className={styles.body}>
            <div className={styles.friendsList}>
                <h1 style = {{margin: 0}}>Friends List</h1>
                <ul>
                    {friends.map(friend => (
                        <li key = {friend} className={styles.listItem}>
                            {friend}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default FriendsList;