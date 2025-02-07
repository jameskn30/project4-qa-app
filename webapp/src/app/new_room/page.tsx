'use client'
import React, { useState } from 'react';
import './NewRoomPage.css';

const NewRoomPage = () => {
  const [roomId, setRoomId] = useState('');

  const handleJoinRoom = () => {
    // Logic to join the room by room_id
    console.log(`Joining room with ID: ${roomId}`);
  };

  return (
    <div className="new-room-page">
      <div className="container">
        <h1>New Room</h1>
        <p>Welcome to the new room page.</p>
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button onClick={handleJoinRoom}>Join Room</button>
      </div>
    </div>
  );
};

export default NewRoomPage;
