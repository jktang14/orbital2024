'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

function Page() {
	const router = useRouter();

	function handleRegisterClick(e) {
		router.push('/registration');
	}

	function handleLoginClick(e) {
		router.push('/login');
	}

	return (
		<div>
			<button onClick={handleRegisterClick}>Register</button>
			<button onClick={handleLoginClick}>Login</button>
    	</div>
  	);
}

export default Page;