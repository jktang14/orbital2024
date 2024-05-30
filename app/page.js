'use client';
import React from 'react';
import styles from './style.module.css';
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
		<div className={styles.root}>
			<div className={styles.title}>
				<h1>ReversiPlus</h1>
			</div>
			<div className={styles.buttons}>
				<button className={styles.register} onClick={handleRegisterClick}>Register</button>
				<button className={styles.login} onClick={handleLoginClick}>Login</button>
			</div>
    	</div>
  	);
}

export default Page;