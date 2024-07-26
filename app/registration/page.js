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
            } else if (errorCode == 'auth/invalid-email') {
                setError('Invalid email format!')
            } else if (errorCode == 'auth/missing-password') {
                setError('No password inputted!');
            } else if (error.message == 'username-already-exists'){
                setError('Username is in use!');
            } else if (error.message == 'wrong-length') {
                setError('Password must be between 8 and 15 characters');
            } else if (error.message == 'missing-lowercase') {
                setError('Password must have at least one lowercase alphabet');
            } else if (error.message == 'missing-uppercase') {
                setError('Password must have at least one uppercase alphabet');
            } else if (error.message == 'missing-digit') {
                setError('Password must have at least 1 digit');
            } else if (error.message == 'missing-special-character') {
                setError('Password must have at least 1 special character');
            } else {
                setError(errorCode);
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