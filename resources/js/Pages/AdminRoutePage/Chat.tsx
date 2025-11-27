import React, { useEffect, useState, useRef } from 'react';
import Pusher from 'pusher-js';
import echo from '../echo';
import apiService from '../Services/ApiService';
import { MessageCircle, Send, User as UserIcon, Circle } from 'lucide-react';

interface User {
    id: number;
    name: string;
    avatar?: string;
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
    const [notifications, setNotifications] = useState<{ [userId: number]: number }>({});
    const chatContainerRef = useRef<HTMLDivElement | null>(null);

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

        const channel = echo.channel(`chat.${currentUserId}`);
        const listener = (event: any) => {
            setNotifications((prev: any) => {
                const senderId = event.chat.sender_id;
                const updatedNotifications = { ...prev };
                updatedNotifications[senderId] = (updatedNotifications[senderId] || 0) + 1;
                return updatedNotifications;
            });
            fetchNotifications();
        };

        channel.listen('.message.sent', listener);
        fetchNotifications();

        return () => {
            echo.leave(`chat.${currentUserId}`);
        };
    }, [currentUserId]);

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

    const selectedUser = users.find((u) => u.id === selectedUserId);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

                .chat-wrapper {
                    background: #F9FAFB;
                    min-height: 100vh;
                    padding: 2rem;
                    font-family: 'Inter', sans-serif;
                }

                .chat-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    display: flex;
                    height: calc(100vh - 4rem);
                    background: white;
                    border-radius: 16px;
                    overflow: hidden;
                    border: 1px solid #E5E7EB;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    animation: slideUp 0.6s ease-out;
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(40px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .users-sidebar {
                    width: 360px;
                    background: #F9FAFB;
                    border-right: 1px solid #E5E7EB;
                    display: flex;
                    flex-direction: column;
                }

                .sidebar-header {
                    padding: 1.75rem 1.5rem;
                    border-bottom: 1px solid #E5E7EB;
                    background: white;
                }

                .sidebar-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1F2937;
                    font-family: 'DM Sans', sans-serif;
                    display: flex;
                    align-items: center;
                    gap: 0.625rem;
                }

                .users-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 0.5rem;
                }

                .user-item {
                    display: flex;
                    align-items: center;
                    gap: 0.875rem;
                    padding: 0.875rem 1rem;
                    margin: 0 0.5rem 0.375rem 0.5rem;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                }

                .user-item:hover {
                    background: #F3F4F6;
                }

                .user-item.active {
                    background: #EFF6FF;
                    border: 1px solid #BFDBFE;
                }

                .user-item.active .user-name {
                    color: #1E40AF;
                    font-weight: 600;
                }

                .user-avatar {
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 1rem;
                    flex-shrink: 0;
                }

                .user-item.active .user-avatar {
                    background: linear-gradient(135deg, #2563EB 0%, #1E40AF 100%);
                }

                .user-info {
                    flex: 1;
                    min-width: 0;
                }

                .user-name {
                    font-weight: 500;
                    color: #1F2937;
                    font-size: 0.9375rem;
                }

                .notification-badge {
                    background: #EF4444;
                    color: white;
                    font-size: 0.6875rem;
                    font-weight: 700;
                    padding: 0.1875rem 0.5rem;
                    border-radius: 10px;
                    min-width: 20px;
                    text-align: center;
                }

                .chat-area {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: white;
                }

                .chat-header {
                    padding: 1.25rem 1.75rem;
                    background: white;
                    border-bottom: 1px solid #E5E7EB;
                    display: flex;
                    align-items: center;
                    gap: 0.875rem;
                }

                .chat-header-avatar {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 1rem;
                }

                .chat-header-name {
                    font-size: 1.125rem;
                    font-weight: 700;
                    color: #1F2937;
                    font-family: 'DM Sans', sans-serif;
                }

                .messages-container {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    background: #F9FAFB;
                }

                .message-wrapper {
                    display: flex;
                    gap: 0.625rem;
                    animation: messageIn 0.3s ease-out;
                }

                @keyframes messageIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .message-wrapper.own-message {
                    flex-direction: row-reverse;
                }

                .message-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 0.875rem;
                    flex-shrink: 0;
                }

                .message-content {
                    max-width: 60%;
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .message-sender {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #6B7280;
                    padding: 0 0.75rem;
                }

                .message-bubble {
                    background: white;
                    padding: 0.75rem 1rem;
                    border-radius: 14px;
                    border: 1px solid #E5E7EB;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                    word-wrap: break-word;
                    color: #1F2937;
                }

                .own-message .message-bubble {
                    background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
                    border: none;
                    color: white;
                }

                .message-time {
                    font-size: 0.6875rem;
                    color: #9CA3AF;
                    padding: 0 0.75rem;
                }

                .own-message .message-content {
                    align-items: flex-end;
                }

                .message-input-area {
                    padding: 1.25rem 1.75rem;
                    background: white;
                    border-top: 1px solid #E5E7EB;
                    display: flex;
                    gap: 0.875rem;
                    align-items: center;
                }

                .message-input {
                    flex: 1;
                    padding: 0.75rem 1.25rem;
                    border: 1px solid #E5E7EB;
                    border-radius: 20px;
                    font-size: 0.9375rem;
                    font-weight: 400;
                    font-family: 'Inter', sans-serif;
                    transition: all 0.2s ease;
                    background: #F9FAFB;
                }

                .message-input:focus {
                    outline: none;
                    border-color: #3B82F6;
                    background: white;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .send-button {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
                    border: none;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                }

                .send-button:hover {
                    transform: scale(1.05);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                }

                .send-button:active {
                    transform: scale(0.95);
                }

                .empty-state {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: #9CA3AF;
                    gap: 0.875rem;
                    background: #F9FAFB;
                }

                .empty-state-icon {
                    color: #D1D5DB;
                }

                .empty-state-text {
                    font-size: 1rem;
                    font-weight: 500;
                    color: #6B7280;
                }
            `}</style>

            <div className="chat-wrapper">
                <div className="chat-container">
                    {/* Users Sidebar */}
                    <div className="users-sidebar">
                        <div className="sidebar-header">
                            <h2 className="sidebar-title">
                                <MessageCircle size={28} />
                                Messages
                            </h2>
                        </div>
                        <div className="users-list">
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    className={`user-item ${selectedUserId === user.id ? 'active' : ''}`}
                                    onClick={() => handleUserClick(user.id)}
                                >
                                    <div className="user-avatar">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="user-info">
                                        <div className="user-name">{user.name}</div>
                                    </div>
                                    {notifications[user.id] > 0 && (
                                        <span className="notification-badge">
                                            {notifications[user.id]}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="chat-area">
                        {selectedUserId && selectedUser ? (
                            <>
                                <div className="chat-header">
                                    <div className="chat-header-avatar">
                                        {selectedUser.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="chat-header-name">{selectedUser.name}</div>
                                </div>

                                <div className="messages-container" ref={chatContainerRef}>
                                    {messages.map((msg) => {
                                        const isCurrentUser = msg.sender_id === currentUserId;
                                        const user = users.find((u) => u.id === msg.sender_id);
                                        return (
                                            <div
                                                key={msg.id}
                                                className={`message-wrapper ${isCurrentUser ? 'own-message' : ''}`}
                                            >
                                                <div className="message-avatar">
                                                    {user?.name?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <div className="message-content">
                                                    <div className="message-sender">
                                                        {isCurrentUser ? 'You' : user?.name}
                                                    </div>
                                                    <div className="message-bubble">
                                                        {msg.message}
                                                    </div>
                                                    <div className="message-time">
                                                        {new Date(msg.created_at).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="message-input-area">
                                    <input
                                        type="text"
                                        className="message-input"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') sendMessage();
                                        }}
                                    />
                                    <button className="send-button" onClick={sendMessage}>
                                        <Send size={20} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="empty-state">
                                <MessageCircle size={64} className="empty-state-icon" />
                                <div className="empty-state-text">Select a contact to start chatting</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserListWithChat;
