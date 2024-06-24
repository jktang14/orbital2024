'use client'
import {React, useEffect, useState} from "react";
import styles from './style.module.css';
import { db } from "../firebase";
import { query, collection, where, getDocs, updateDoc, doc, onSnapshot, arrayRemove} from "firebase/firestore";
import { realtimeDatabase } from "../firebase";
import { onValue, ref } from "firebase/database";
import { GetFriends } from "../components/get-friends";
import { InviteFriend } from "../components/invite-friend";
import { AddFriend } from "../components/add-friend";

const FriendsList = () => {
    const [friends, setFriends] = useState([]);
    const [username, setUsername] = useState('');
    const [searchUsername, setSearchUsername] = useState('');
    const [friendRequests, setFriendRequests] = useState([]);

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
            if (username) {
                const q = query(collection(db, 'users'), where('username', '==', username));
                const querySnapshot = await getDocs(q);
                const userId = querySnapshot.docs[0].id;
                const userDoc = doc(db, 'users', userId);
        
                const unsubscribe = onSnapshot(userDoc, async (doc) => {
                    const userData = doc.data();
                    const userFriends = await GetFriends(username);
                    if (Array.isArray(userFriends)) {
                        setFriends(userFriends);
                        setFriendRequests(userData.friendRequests);
                    }
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
        if (Array.isArray(friends)) {
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
        }
    }, [friends])

    const handleDeclineInvite = async (friend) => {
        // Remove friend from friendRequests
        const q = query(collection(db, 'users'), where('username', '==', username));
        const querySnapshot = await getDocs(q);
        const userId = querySnapshot.docs[0].id;
        const userDoc = doc(db, 'users', userId);

        await updateDoc(userDoc, {
            friendRequests: arrayUnion(friend)
        })
    }
    
    return (
        <div className={styles.body}>
            <div className={styles.friendsList}>
                <h1 style = {{margin: 0}}>Friends List</h1>
                <form className={styles.form} onSubmit={() => InviteFriend(username, searchUsername)}> 
                    <input 
                        type="text" 
                        onChange={(e) => setSearchUsername(e.target.value)}
                        value = {searchUsername}
                        placeholder="Search for username"
                    />
                    <button type="submit">Add user</button>
                </form>
                <ul>
                    {Array.isArray(friends) && friends.map(friend => (
                        <li key = {friend} className={styles.listItem}>
                            {friend.username} {friend.status}
                        </li>
                    ))}
                </ul>
            </div>

            <div className={styles.friendRequests}>
                <ul>
                    {Array.isArray(friendRequests) && friendRequests.map(request => (
                        <li key={request}>
                            {request}
                            <button onClick={() => AddFriend(username, request)}>Accept</button>
                            <button onClick={() => handleDeclineInvite(request)}>Decline</button>
                        </li>
                    ))}
                </ul>
                
            </div>
        </div>
    )
}

export default FriendsList;