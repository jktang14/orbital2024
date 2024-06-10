'use client';
import React from 'react';
import { useState } from 'react';
import { LoginUser } from '../components/auth';
import styles from './style.module.css';
import { useRouter } from 'next/navigation';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    async function handleLogin(e) {
        e.preventDefault();
        try {
            let {user, username} = await LoginUser(email, password);
            // Navigate to main page only if email verified
            if (user.emailVerified) {
                // Store username
                localStorage.setItem('username', username);
                router.push('../game') // Navigate to game page
            } else {
                setError('Please verify your email first!')
            } 
        } catch (error) {
            let errorCode = error.code;
            if (errorCode == 'auth/invalid-credential') {
                setError('Email or password is wrong!');
            } else if (errorCode == 'auth/missing-password') {
                setError('No password inputted!');
            } else if (errorCode == 'auth/invalid-email') {
                setError('Please input an email');
            } else {
                setError('');
            }
        }
    }

    return (
        <div className={styles.root}>
            <form className={styles.form} onSubmit={handleLogin}>
                <label>Email: </label>
                <input type="text" placeholder='Email' value={email} onChange={e => setEmail(e.target.value)}/><br/>
                <label>Password: </label>
                <input type="text" placeholder='Password' value={password} onChange={e => setPassword(e.target.value)}/><br/>
                <button type="submit">Login</button>
                {error && <p>{error}</p>}
            </form>
            
        </div>
    );
}

export default Login;