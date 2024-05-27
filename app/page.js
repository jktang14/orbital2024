import React from 'react';
import Reversi from './reversi/reversi.jsx';
import ResponsiveAppBar from './navbar.jsx';

function Home() {
  return (
    <div>
      <ResponsiveAppBar/>
      <Reversi/>
    </div>
  );
}

export default Home;