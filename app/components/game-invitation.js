import React from 'react';

export const GameInvitation = ({ request, onAccept, onDecline }) => {
    
    const handleDecline = async () => {
        try {
            await onDecline();
        } catch (error) {
            console.log(error);
        }
    }

    const handleAccept = async () => {
        try {
            await onAccept();
        } catch (error) {
            console.log(error);
        }
    }
    
    return (
        <div>
            <p>Game request from {request}</p>
            <div>
                <button onClick={handleAccept}>Accept</button>
                <button onClick={handleDecline}>Decline</button>
            </div>
        </div>
    );
};