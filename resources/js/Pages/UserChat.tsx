import React, { useEffect, useState, useRef } from 'react';
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
    Badge,
    Tooltip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import echo from './echo';
import apiService from './Services/ApiService';


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
    const [notifications, setNotifications] = useState<{ [userId: number]: number }>({});
    


   

    const handleUserClick = async (userId: number) => {
        setSelectedUserId(userId);
    
        try {
            const res = await apiService.get('/notifications');
    
            const userNotifications = res.data.filter((n: any) => n.chat.sender_id === userId);
    
            for (const notif of userNotifications) {
                await apiService.put(`/notifications/${notif.id}/read`, {});
            }
    
            setNotifications((prev) => {
                const updated = { ...prev };
                delete updated[userId];
                return updated;
            });
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    useEffect(() => {
        if (!currentUserId) return;
    
        const fetchNotifications = async () => {
            try {
                const response = await apiService.get('/notifications');
    
                const notificationCounts: { [userId: number]: number } = {};
    
                response.data.forEach((notif: any) => {
                    const senderId = notif.chat.sender_id;
                    notificationCounts[senderId] = (notificationCounts[senderId] || 0) + 1;
                });
    
                setNotifications(notificationCounts);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };
    
        // Using Echo to listen for real-time events
        const channel = echo.channel(`chat.${currentUserId}`);
    
        const listener = (event: any) => {
            console.log('🔔 New message:', event.chat);
    
            // Update notifications on new message
            setNotifications((prev: any) => {
                const senderId = event.chat.sender_id;
                const updatedNotifications = { ...prev };
                updatedNotifications[senderId] = (updatedNotifications[senderId] || 0) + 1;
                return updatedNotifications;
            });
    
            // Optionally, you can call fetchNotifications() here to refresh notifications
            fetchNotifications(); // This will update the notification counts in real-time
        };
    
        // Listen for 'MessageSent' event
        channel.listen('.message.sent', listener); // This should work as it matches the broadcastAs in Laravel
    
        // Initial notification fetch when component mounts
        fetchNotifications();
    
        // Cleanup to leave the channel when the component unmounts
        return () => {
            echo.leave(`chat.${currentUserId}`);
        };
    }, [currentUserId]);
    
    



    // Fetch current user
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const res = await apiService.get('/current-user');
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
                const response = await apiService.get<User[]>('/users');
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
                const response = await apiService.get<ChatMessage[]>(`/chat/${selectedUserId}`);
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
            await apiService.post('/chat/send', payload);
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
                                onClick={() => handleUserClick(user.id)}
                                sx={{
                                    '&.Mui-selected': {
                                        backgroundColor: '#f0f0f0',
                                    },
                                }}
                            >
                                <ListItemAvatar>
                                    <Badge
                                        color="secondary"
                                        badgeContent={notifications[user.id] || 0}
                                        invisible={notifications[user.id] === 0}
                                    >
                                        <Avatar alt={user.name} src={user.avatar || ''} />
                                    </Badge>
                                </ListItemAvatar>
                                <Typography variant="body1">{user.name}</Typography>
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Paper>

            {/* Chat Interface */}
            <Box sx={{ flex: 1, p: 2, bgcolor: '#f5f7fa', borderRadius: 2, maxHeight: '100%', overflow: 'auto' }}>
                {selectedUserId ? (
                    <>
                        <Typography variant="h5" gutterBottom>
                            Chat with {users.find((u) => u.id === selectedUserId)?.name}
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Paper
                            ref={chatContainerRef}
                            elevation={0}
                            sx={{
                                maxHeight: '70vh',
                                overflowY: 'auto',
                                p: 2,
                                mb: 2,
                                backgroundColor: '#ffffff',
                                borderRadius: 2,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            }}
                        >
                            {messages.map((msg) => {
                                const isCurrentUser = msg.sender_id === currentUserId;
                                const user = users.find((u) => u.id === msg.sender_id);
                                return (
                                    <Box
                                        key={msg.id}
                                        sx={{
                                            display: 'flex',
                                            flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                                            alignItems: 'flex-start',
                                            mb: 2,
                                            gap: 1,
                                        }}
                                    >
                                        <Tooltip title={user?.name || 'User'}>
                                            <Avatar
                                                alt={isCurrentUser ? 'You' : user?.name || 'User'}
                                                src={user?.avatar || ''}
                                            />
                                        </Tooltip>

                                        <Box
                                            sx={{
                                                maxWidth: '70%',
                                                p: 1.5,
                                                borderRadius: 3,
                                                bgcolor: isCurrentUser ? '#DCF8C6' : '#E5E5EA',
                                                color: 'black',
                                                boxShadow: 1,
                                                transition: 'all 0.3s ease',
                                            }}
                                        >
                                            <Typography
                                                variant="subtitle2"
                                                sx={{ fontWeight: 600, mb: 0.5 }}
                                            >
                                                {isCurrentUser ? 'You' : user?.name}
                                            </Typography>
                                            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                                {msg.message}
                                            </Typography>
                                            <Tooltip
                                                title={new Date(msg.created_at).toLocaleString()}
                                                placement="top"
                                            >
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{ mt: 0.5, display: 'block', textAlign: isCurrentUser ? 'right' : 'left' }}
                                                >
                                                    {new Date(msg.created_at).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </Typography>
                                            </Tooltip>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Paper>

                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 1,
                                bgcolor: 'white',
                                borderRadius: 2,
                                boxShadow: 1,
                            }}
                        >
                            <TextField
                                fullWidth
                                size="small"
                                variant="outlined"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') sendMessage();
                                }}
                            />
                            <IconButton color="primary" onClick={sendMessage} sx={{ borderRadius: 2 }}>
                                <SendIcon />
                            </IconButton>
                        </Box>
                    </>
                ) : (
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        Select a contact to start chatting
                    </Typography>
                )}
            </Box>

        </Box>
    );
};

export default UserListWithChat;
