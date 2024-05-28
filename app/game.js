import React from 'react';
import Reversi from './reversi/reversi.jsx';
import ResponsiveAppBar from './navbar.jsx';

function Game() {
  return (
    <div>
      <ResponsiveAppBar/>
      <Reversi/>
    </div>
  )
}

export default Game;