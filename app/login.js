'use client';
import React from 'react';
import { useState } from 'react';
import { LoginUser } from './components/auth';
import { useRouter } from 'next/navigation';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    async function handleLogin(e) {
        e.preventDefault();
        let {user, username} = await LoginUser(email, password);
        // Store username
        localStorage.setItem('username', username);
        router.push('/game') // Navigate to game page
    }

    return (
        <div>
            <form onSubmit={handleLogin}>
                <label>Email: </label>
                <input type="text" placeholder='Email' value={email} onChange={e => setEmail(e.target.value)}/><br/>
                <label>Password: </label>
                <input type="text" placeholder='Password' value={password} onChange={e => setPassword(e.target.value)}/><br/>
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login;