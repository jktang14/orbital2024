'use client';
import { useState } from 'react';
import React from 'react';
import { SignUpUser } from './components/auth';
import { Router, useRouter } from 'next/navigation';

function Registration() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const router = useRouter();
    
    async function handleRegistration(e) {
        // Prevent page refresh
        e.preventDefault();
        await SignUpUser(email, password, username);
        router.push('');
    }
    
    return (
        <>
            <form onSubmit={handleRegistration}>
                <label>Email: </label>
                <input type="text" placeholder='Email' value={email} onChange={e => setEmail(e.target.value)}/><br/>
                <label>Password: </label>
                <input type="text" placeholder='Password' value={password} onChange={e => setPassword(e.target.value)}/><br/>
                <label>Username: </label>
                <input type="text" placeholder='Username' value={username} onChange={e => setUsername(e.target.value)}/><br/>
                <button type="submit">Register</button>
            </form>
        </>
    );
}

export default Registration;