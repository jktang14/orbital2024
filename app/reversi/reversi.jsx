"use client";
import React, { createElement, useRef } from 'react'
import '../ui/style.css'
import './game-logic'

const Reversi = () => {
    {/*Create grid*/}
    const CreateGrid = () => {
        let items = [];
        for (let i = 0; i < 64; i++) {
            if (i == 27 || i == 36) {
                let piece = createElement('img', {src:'black.png'});
                let block = createElement('div', {className: 'piece'}, piece); 
                items.push(createElement('div', {id: 'grid-item', className: `grid-item-${i}`}, block));
            } else if (i == 28 || i == 35) {
                let piece = createElement('img', {src:'white.png'});
                let block = createElement('div', {className: 'piece'}, piece); 
                items.push(createElement('div', {id: 'grid-item', className: `grid-item-${i}`}, block));
            } else {
                items.push(createElement('div', {id: 'grid-item', className: `grid-item-${i}`}));
            }
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
