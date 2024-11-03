import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';

const PinEntry = ({pin,setPin,inputPin, setInputPin,setIsLocked,receiverId}) => {
    const {Authuser}=useAuthContext();
    const handleButtonClick = (digit) => {
        if (inputPin.length < 4) {
            setInputPin(inputPin + digit);
        }
    };

    const handleDelete = () => {
        setInputPin(inputPin.slice(0, -1));
    };

    const handleClear = () => {
        setInputPin('');
    };

    const handleSubmit = async () => {
        if (inputPin.length === 4) {
            const lockedChat = Authuser.LockedChats.find(lock => lock.userId === receiverId);
            if (lockedChat) {
                // Check if the entered pin matches the stored hashed password
                const isMatch = inputPin===lockedChat.password;
                if (isMatch) {
                    setIsLocked(false);
                } else {
                    alert('Incorrect PIN.');
                }
            } else {
                alert('No locked chat found.');
            }
            
            handleClear();
        } else {
            alert('Please enter a 4-digit PIN.');
        }
    };

    return (
        <div style={styles.container}>
            <h2>Enter PIN</h2>
            <div style={styles.pinDisplay}>
                {[...Array(4)].map((_, i) => (
                    <span key={i} style={styles.pinDot}>
                        {i < inputPin.length ? '●' : '○'}
                    </span>
                ))}
            </div>

            <div style={styles.keypad}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((digit) => (
                    <button
                        key={digit}
                        style={styles.keypadButton}
                        onClick={() => handleButtonClick(digit)}
                    >
                        {digit}
                    </button>
                ))}
            </div>

            <div style={styles.actions}>
                <button style={styles.actionButton} onClick={handleDelete}>Delete</button>
                <button style={styles.actionButton} onClick={handleClear}>Clear</button>
                <button style={styles.actionButton} onClick={handleSubmit}>Submit</button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '200px',
        margin: '20px auto',
        fontFamily: 'Arial, sans-serif',
    },
    pinDisplay: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        fontSize: '24px',
    },
    pinDot: {
        width: '15px',
        textAlign: 'center',
    },
    keypad: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 50px)',
        gap: '10px',
        marginBottom: '20px',
    },
    keypadButton: {
        width: '50px',
        height: '50px',
        fontSize: '18px',
        cursor: 'pointer',
        backgroundColor: '#f0f0f0',
        border: '1px solid #ddd',
        borderRadius: '5px',
        transition: 'background-color 0.3s',
    },
    actions: {
        display: 'flex',
        gap: '10px',
    },
    actionButton: {
        padding: '8px 12px',
        cursor: 'pointer',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        fontSize: '14px',
    },
};

export default PinEntry;
