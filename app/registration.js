import { useState } from 'react';
import React from 'react';
import { signUpUser } from './components/auth';
import { Router } from 'next/router';

function registration() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    async function handleRegistration(e) {
        // Prevent page refresh
        e.preventDefault();
        try {
            await signUpUser(email, password, username);
            Router.push('');
        } catch (err) {

        }
    }
  
  
    return (
    <div>registration</div>
  )
}

export default registration;