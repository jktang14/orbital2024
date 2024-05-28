'use client';
import React from 'react';
import { LoginUser } from './components/auth';
import { useRouter } from 'next/navigation';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    async function handleLogin(e) {
        e.preventdefault();
        let {user, username} = await LoginUser(email, password);
        // Store username
        localStorage.setItem('username', username);
        router.push('./game') // Push to login page
    }
  
  
  
    return (
    <div>Login</div>
  )
}

export default Login;