// // components/StudentComponent.tsx

// import React, { useState, useEffect } from 'react';
// import io, { Socket } from 'socket.io-client';

// const SOCKET_IO_URL = "http://localhost:3000/api/v1"; // The client connects to the proxy server
// const socket: Socket = io(SOCKET_IO_URL);

// interface ChatMessage {
//   id: string;
//   content: string;
//   confirmed: boolean;
// }

// const ChatStudent: React.FC = () => {
//   const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

//   useEffect(() => {
//     // Listen for incoming messages
//     socket.on('message_from_server', (msg: ChatMessage) => {
//       setChatMessages((prevMessages) => [...prevMessages, msg]);
//     });

//     // Listen for message confirmation
//     socket.on('message_confirmed', (confirmedMessageId: string) => {
//       setChatMessages((prevMessages) =>
//         prevMessages.map((msg) =>
//           msg.id === confirmedMessageId ? { ...msg, confirmed: true } : msg
//         ),
//       );
//     });

//     // Clean up the effect
//     return () => {
//       socket.off('message_from_server');
//       socket.off('message_confirmed');
//     };
//   }, []);

//   // Function to send a confirmation for a message
//   const confirmMessage = (messageId: string): void => {
//     socket.emit('confirm_message', messageId);
//   };

//   return (
//     <div>
//       {chatMessages.map((msg, index) => (
//         <div key={index}>
//           {msg.content}
//           {!msg.confirmed && (
//             <button onClick={() => confirmMessage(msg.id)}>Confirm</button>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default ChatStudent;
