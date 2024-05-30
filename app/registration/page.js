'use client';
import { useState } from 'react';
import React from 'react';
import { SignUpUser } from '../components/auth';
import styles from './style.module.css';
import { Router, useRouter } from 'next/navigation';

function Registration() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    
    async function handleRegistration(e) {
        // Prevent page refresh
        e.preventDefault();
        
        // Force user to input a username
        if (!username) {
            setError('Please input a username');
            return;
        }
        
        try {
            await SignUpUser(email, password, username);
            router.push('../login');
        } catch (error) {
            let errorCode = error.code;
            if (errorCode == 'auth/weak-password') {
                setError('Password should be at least 6 letters!');
            } else if (errorCode == 'auth/email-already-in-use') {
                setError('Email address already in use!');
            } else {
                setError('');
            }
        }
    }
    
    return (
        <div className={styles.root}>
            <form className={styles.form} onSubmit={handleRegistration}>
                <label>Email: </label>
                <input type="text" placeholder='Email' value={email} onChange={e => setEmail(e.target.value)}/><br/>
                <label>Password: </label>
                <input type="text" placeholder='Password' value={password} onChange={e => setPassword(e.target.value)}/><br/>
                <label>Username: </label>
                <input type="text" placeholder='Username' value={username} onChange={e => setUsername(e.target.value)}/><br/>
                <button type="submit">Register</button>
                {error && <p>{error}</p>}
            </form>
            
        </div>
    );
}

export default Registration;