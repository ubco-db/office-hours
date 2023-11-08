import React, { useState } from "react";
import io, { Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:3000");

const ChatTA: React.FC = () => {
  const [message, setMessage] = useState<string>("");

  // Function to send a message to the server
  // const sendMessage = (): void => {
  //   if (message.trim()) {
  //     socket.emit('send_message', { id: 25, content: message });
  //     setMessage('Join zoom');
  //   }
  // };

  return (
    <div>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
      <button>Send Message</button>
    </div>
  );
};

export default ChatTA;
