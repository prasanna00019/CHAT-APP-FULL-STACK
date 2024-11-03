import React, { useState } from 'react';

const ChatLock = () => {
    const [isLocked, setIsLocked] = useState(false);
    const [pin, setPin] = useState('');
    const [inputPin, setInputPin] = useState('');
    const [error, setError] = useState(null);

    // This function "locks" the chat by setting a PIN
    const handleSetPin = () => {
        if (pin.length === 4) {
            setIsLocked(true);
            setError(null);
        } else {
            setError('Please enter a 4-digit PIN');
        }
    };

    // This function "unlocks" the chat by comparing input PIN to the set PIN
    const handleUnlock = () => {
        if (inputPin === pin) {
            setIsLocked(false);
            setError(null);
        } else {
            setError('Incorrect PIN');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '300px', margin: '0 auto' }}>
            <h2>{isLocked ? 'Chat Locked' : 'Chat Unlocked'}</h2>

            {isLocked ? (
                <div>
                    <p>Enter PIN to unlock:</p>
                    <input
                        type="password"
                        maxLength="4"
                        value={inputPin}
                        onChange={(e) => setInputPin(e.target.value)}
                        placeholder="4-digit PIN"
                    />
                    <button onClick={handleUnlock}>Unlock</button>
                </div>
            ) : (
                <div>
                    <p>Set a new PIN to lock the chat:</p>
                    <input
                        type="password"
                        maxLength="4"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="4-digit PIN"
                    />
                    <button onClick={handleSetPin}>Lock Chat</button>
                </div>
            )}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {!isLocked && <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
                <p>🔓 This is the chat content, visible only when unlocked!</p>
            </div>}
        </div>
    );
};

export default ChatLock;
