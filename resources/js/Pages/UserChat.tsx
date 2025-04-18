import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';
import {
    Box,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    Typography,
    TextField,
    Paper,
    Divider,
    IconButton,
    ListItemButton,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

interface User {
    id: number;
    name: string;
    avatar?: string; // Optional avatar URL
}

interface ChatMessage {
    id: number;
    sender_id: number;
    receiver_id: number;
    message: string;
    created_at: string;
}

interface SendMessagePayload {
    receiver_id: number;
    message: string;
}

const UserListWithChat: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');

    const chatContainerRef = useRef<HTMLDivElement | null>(null);

    // Fetch current user
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const res = await axios.get('/api/current-user', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setCurrentUserId(res.data.id);
            } catch (error) {
                console.error('Error fetching current user:', error);
            }
        };

        fetchCurrentUser();
    }, []);

    // Fetch users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get<User[]>('/api/users', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    // Fetch messages when a user is selected
    useEffect(() => {
        if (!selectedUserId) return;

        const fetchMessages = async () => {
            try {
                const response = await axios.get<ChatMessage[]>(`/api/chat/${selectedUserId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setMessages(response.data);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();
    }, [selectedUserId]);

    // Setup Pusher for real-time messaging
    useEffect(() => {
        if (!currentUserId) return;

        const pusher = new Pusher(import.meta.env.VITE_REVERB_APP_KEY, {
            wsHost: import.meta.env.VITE_REVERB_HOST,
            wsPort: parseInt(import.meta.env.VITE_REVERB_PORT, 10),
            forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
            cluster: 'mt1',
            enabledTransports: ['ws', 'wss'],
        });

        const channel = pusher.subscribe(`chat.${currentUserId}`);
        channel.bind('message.sent', (data: { chat: ChatMessage }) => {
            const msg = data.chat;
            if (msg.sender_id === selectedUserId || msg.receiver_id === selectedUserId) {
                setMessages((prev) => [...prev, msg]);
            }
        });

        return () => {
            pusher.unsubscribe(`chat.${currentUserId}`);
        };
    }, [currentUserId, selectedUserId]);

    // Scroll to bottom of chat container
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async () => {
        if (!selectedUserId || newMessage.trim() === '') return;

        const payload: SendMessagePayload = {
            receiver_id: selectedUserId,
            message: newMessage,
        };

        const tempMessage: ChatMessage = {
            id: Date.now(),
            sender_id: currentUserId!,
            receiver_id: selectedUserId,
            message: newMessage,
            created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, tempMessage]);

        try {
            await axios.post('/api/chat/send', payload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });

            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh', padding: 2 }}>
            {/* User List */}
            <Paper sx={{ width: '30%', borderRight: '1px solid #ccc', padding: 2, overflowY: 'auto' }}>
                <Typography variant="h6" gutterBottom>
                    Contacts
                </Typography>
                <Divider />
                <List>
                    {users.map((user) => (
                        <ListItem key={user.id} disablePadding>
                            <ListItemButton
                                selected={selectedUserId === user.id}
                                onClick={() => setSelectedUserId(user.id)}
                                sx={{
                                    '&.Mui-selected': {
                                        backgroundColor: '#f0f0f0',
                                    },
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar alt={user.name} src={user.avatar || ''} />
                                </ListItemAvatar>
                                <Typography variant="body1">{user.name}</Typography>
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Paper>

            {/* Chat Interface */}
            <Box sx={{ flex: 1, padding: 2 }}>
                {selectedUserId ? (
                    <>
                        <Typography variant="h5" gutterBottom>
                            Chat with {users.find((u) => u.id === selectedUserId)?.name}
                        </Typography>
                        <Divider />
                        <Paper
                            ref={chatContainerRef}
                            sx={{
                                maxHeight: '70vh',
                                overflowY: 'auto',
                                padding: 2,
                                marginBottom: 2,
                                wordWrap: 'break-word',
                                wordBreak: 'break-word',
                            }}
                        >
                            {messages.map((msg) => (
                                <Box
                                    key={msg.id}
                                    sx={{
                                        display: 'flex',
                                        flexDirection: msg.sender_id === currentUserId ? 'row-reverse' : 'row',
                                        alignItems: 'flex-start',
                                        marginBottom: 1,
                                    }}
                                >
                                    <Avatar
                                        alt={
                                            msg.sender_id === currentUserId
                                                ? 'You'
                                                : users.find((u) => u.id === msg.sender_id)?.name || 'User'
                                        }
                                        src={
                                            msg.sender_id === currentUserId
                                                ? users.find((u) => u.id === currentUserId)?.avatar || ''
                                                : users.find((u) => u.id === msg.sender_id)?.avatar || ''
                                        }
                                        sx={{ margin: '0 8px' }}
                                    />
                                    <Box
                                        sx={{
                                            maxWidth: '70%',
                                            padding: 1,
                                            borderRadius: 2,
                                            backgroundColor:
                                                msg.sender_id === currentUserId ? '#DCF8C6' : '#ECECEC',
                                        }}
                                    >
                                        <Typography variant="subtitle2">
                                            {msg.sender_id === currentUserId ? 'You' : users.find((u) => u.id === msg.sender_id)?.name}
                                        </Typography>
                                        <Typography variant="body1">{msg.message}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Paper>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                fullWidth
                                size="small"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') sendMessage();
                                }}
                            />
                            <IconButton color="primary" onClick={sendMessage}>
                                <SendIcon />
                            </IconButton>
                        </Box>
                    </>
                ) : (
                    <Typography variant="body1">Select a contact to start chatting</Typography>
                )}
            </Box>
        </Box>
    );
};

export default UserListWithChat;