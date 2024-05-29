import React from 'react';
import Reversi from '../reversi/reversi.jsx';
import ResponsiveAppBar from '../navbar.jsx';
import styles from './style.module.css';

function Game() {
  return (
    <div className={styles.body}>
      <ResponsiveAppBar/>
      <Reversi/>
    </div>
  )
}

export default Game;