// import React, { useState } from 'react';
// import {
//   Box,
//   Paper,
//   Typography,
//   Avatar,
//   IconButton,
//   TextField,
//   Stack,
//   Badge,
// } from '@mui/material';
// import {
//   Send as SendIcon,
//   Close as CloseIcon,
//   Remove as MinimizeIcon,
// } from '@mui/icons-material';

// interface Message {
//   id: string;
//   content: string;
//   isMe: boolean;
//   timestamp: string;
// }

// interface FloatingChatProps {
//   conversationName?: string;
//   currentUsername?: string;
// }

// export default function FloatingChatWidget({
//   conversationName = 'sam&him',
// }: FloatingChatProps) {
//   const [isMinimized, setIsMinimized] = useState(false);
//   const [isOpen, setIsOpen] = useState(true);
//   const [isTyping, setIsTyping] = useState(true); // Toggle to test typing state
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: '1',
//       content: 'Hey, are we still on for later?',
//       isMe: false,
//       timestamp: '11:05 AM',
//     },
//     {
//       id: '2',
//       content: 'Yes, see you then!',
//       isMe: true,
//       timestamp: '11:06 AM',
//     },
//   ]);
//   const [inputMessage, setInputMessage] = useState('');

//   if (!isOpen) return null;

//   const handleSend = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!inputMessage.trim()) return;

//     setMessages((prev) => [
//       ...prev,
//       {
//         id: Date.now().toString(),
//         content: inputMessage,
//         isMe: true,
//         timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//       },
//     ]);
//     setInputMessage('');
//   };

//   return (
//     <Box
//       sx={{
//         position: 'fixed',
//         bottom: 0,
//         right: 24,
//         width: 320,
//         zIndex: 1300,
//         boxShadow: 6,
//         borderTopLeftRadius: 8,
//         borderTopRightRadius: 8,
//         overflow: 'hidden',
//         backgroundColor: '#fff',
//       }}
//     >
//       {/* Chat Header */}
//       <Box
//         sx={{
//           backgroundColor: '#ffffff',
//           borderBottom: '1px solid #e0e0e0',
//           padding: '8px 12px',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//           cursor: 'pointer',
//         }}
//         onClick={() => setIsMinimized(!isMinimized)}
//       >
//         <Stack direction="row" spacing={1} alignItems="center">
//           <Badge
//             overlap="circular"
//             anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//             variant="dot"
//             sx={{
//               '& .MuiBadge-badge': {
//                 backgroundColor: '#44b700',
//                 color: '#44b700',
//                 boxShadow: '0 0 0 2px #fff',
//               },
//             }}
//           >
//             <Avatar sx={{ width: 32, height: 32 }} alt={conversationName} src="" />
//           </Badge>
//           <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1c1e21' }}>
//             {conversationName}
//           </Typography>
//         </Stack>

//         <Stack direction="row" spacing={0.5} onClick={(e) => e.stopPropagation()}>
//           <IconButton size="small" onClick={() => setIsMinimized(!isMinimized)}>
//             <MinimizeIcon fontSize="small" />
//           </IconButton>
//           <IconButton size="small" onClick={() => setIsOpen(false)}>
//             <CloseIcon fontSize="small" />
//           </IconButton>
//         </Stack>
//       </Box>

//       {/* Chat Body (Collapsible) */}
//       {!isMinimized && (
//         <>
//           {/* Message History */}
//           <Box
//             sx={{
//               height: 280,
//               overflowY: 'auto',
//               padding: 2,
//               display: 'flex',
//               flexDirection: 'column',
//               gap: 1,
//               backgroundColor: '#f9f9f9',
//             }}
//           >
//             {messages.map((msg) => (
//               <Box
//                 key={msg.id}
//                 sx={{
//                   display: 'flex',
//                   justifyContent: msg.isMe ? 'flex-end' : 'flex-start',
//                 }}
//               >
//                 <Paper
//                   elevation={0}
//                   sx={{
//                     maxWidth: '75%',
//                     padding: '6px 10px',
//                     borderRadius: 2,
//                     backgroundColor: msg.isMe ? '#0084ff' : '#e4e6eb',
//                     color: msg.isMe ? '#fff' : '#050505',
//                   }}
//                 >
//                   <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
//                     {msg.content}
//                   </Typography>
//                 </Paper>
//               </Box>
//             ))}

//             {/* Typing Indicator Bubble */}
//             {isTyping && (
//               <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 1 }}>
//                 <Avatar sx={{ width: 20, height: 20 }} />
//                 <Paper
//                   elevation={0}
//                   sx={{
//                     padding: '8px 12px',
//                     borderRadius: 2,
//                     backgroundColor: '#e4e6eb',
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: '4px',
//                     width: 'fit-content',
//                   }}
//                 >
//                   <Box
//                     sx={{
//                       width: 6,
//                       height: 6,
//                       backgroundColor: '#65676b',
//                       borderRadius: '50%',
//                       animation: 'pulse 1.4s infinite ease-in-out both',
//                       '@keyframes pulse': {
//                         '0%, 80%, 100%': { transform: 'scale(0)' },
//                         '40%': { transform: 'scale(1.0)' },
//                       },
//                       animationDelay: '0s',
//                     }}
//                   />
//                   <Box
//                     sx={{
//                       width: 6,
//                       height: 6,
//                       backgroundColor: '#65676b',
//                       borderRadius: '50%',
//                       animation: 'pulse 1.4s infinite ease-in-out both',
//                       animationDelay: '0.2s',
//                     }}
//                   />
//                   <Box
//                     sx={{
//                       width: 6,
//                       height: 6,
//                       backgroundColor: '#65676b',
//                       borderRadius: '50%',
//                       animation: 'pulse 1.4s infinite ease-in-out both',
//                       animationDelay: '0.4s',
//                     }}
//                   />
//                 </Paper>
//               </Box>
//             )}
//           </Box>

//           {/* Message Input Footer */}
//           <Box
//             component="form"
//             onSubmit={handleSend}
//             sx={{
//               padding: '8px 12px',
//               borderTop: '1px solid #e0e0e0',
//               backgroundColor: '#fff',
//               display: 'flex',
//               alignItems: 'center',
//               gap: 1,
//             }}
//           >
//             <TextField
//               fullWidth
//               size="small"
//               placeholder="Aa"
//               value={inputMessage}
//               onChange={(e) => setInputMessage(e.target.value)}
//               sx={{
//                 '& .MuiOutlinedInput-root': {
//                   borderRadius: 4,
//                   backgroundColor: '#f0f2f5',
//                   '& fieldset': { border: 'none' },
//                 },
//               }}
//             />
//             {inputMessage.trim() && (
//               <IconButton type="submit" color="primary" size="small">
//                 <SendIcon fontSize="small" />
//               </IconButton>
//             )}
//           </Box>
//         </>
//       )}
//     </Box>
//   );
// }