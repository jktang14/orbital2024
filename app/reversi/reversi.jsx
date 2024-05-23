"use client";
import React, { createElement, useRef } from 'react'
import '../ui/style.css'
import './game-logic'

const Reversi = () => {
    const CreateGrid = () => {
        let items = [];
        for (let i = 0; i < 64; i++) {
            items.push(createElement('div', {id: 'grid-item', className: `grid-item-${i}`}));
        }
        return items;
    }
    return (
    <div>
        {/*Create container for the grid*/}
        <div className='container'>
            <CreateGrid/>
        </div>
    </div>
  )
}

export default Reversi
