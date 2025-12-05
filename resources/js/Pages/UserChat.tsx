import React, { useEffect, useState, useRef } from 'react';
import Pusher from 'pusher-js';
import { MessageCircle, Send, Users, Circle } from 'lucide-react';
import echo from './echo';
import apiService from './Services/ApiService';
import SharedStyles from './SharedStyles';

interface User { id: number; name: string; avatar?: string; }
interface ChatMessage { id: number; sender_id: number; receiver_id: number; message: string; created_at: string; }

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
            setNotifications((prev) => { const updated = { ...prev }; delete updated[userId]; return updated; });
        } catch (error) { console.error('Error:', error); }
    };

    useEffect(() => {
        if (!currentUserId) return;
        const fetchNotifications = async () => {
            try {
                const response = await apiService.get('/notifications');
                const counts: { [userId: number]: number } = {};
                response.data.forEach((n: any) => { counts[n.chat.sender_id] = (counts[n.chat.sender_id] || 0) + 1; });
                setNotifications(counts);
            } catch (error) { console.error('Error:', error); }
        };
        const channel = echo.channel(`chat.${currentUserId}`);
        channel.listen('.message.sent', () => fetchNotifications());
        fetchNotifications();
        return () => { echo.leave(`chat.${currentUserId}`); };
    }, [currentUserId]);

    useEffect(() => {
        apiService.get('/current-user').then((res) => setCurrentUserId(res.data.id)).catch((e) => console.error('Error:', e));
    }, []);

    useEffect(() => {
        apiService.get<User[]>('/users').then((response) => setUsers(response.data)).catch((e) => console.error('Error:', e));
    }, []);

    useEffect(() => {
        if (!selectedUserId) return;
        apiService.get<ChatMessage[]>(`/chat/${selectedUserId}`).then((response) => setMessages(response.data)).catch((e) => console.error('Error:', e));
    }, [selectedUserId]);

    useEffect(() => {
        if (!currentUserId) return;
        const pusher = new Pusher(import.meta.env.VITE_REVERB_APP_KEY, { wsHost: import.meta.env.VITE_REVERB_HOST, wsPort: parseInt(import.meta.env.VITE_REVERB_PORT, 10), forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https', cluster: 'mt1', enabledTransports: ['ws', 'wss'] });
        const channel = pusher.subscribe(`chat.${currentUserId}`);
        channel.bind('message.sent', (data: { chat: ChatMessage }) => {
            if (data.chat.sender_id === selectedUserId || data.chat.receiver_id === selectedUserId) setMessages((prev) => [...prev, data.chat]);
        });
        return () => { pusher.unsubscribe(`chat.${currentUserId}`); };
    }, [currentUserId, selectedUserId]);

    useEffect(() => { chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' }); }, [messages]);

    const sendMessage = async () => {
        if (!selectedUserId || newMessage.trim() === '') return;
        setMessages((prev) => [...prev, { id: Date.now(), sender_id: currentUserId!, receiver_id: selectedUserId, message: newMessage, created_at: new Date().toISOString() }]);
        try { await apiService.post('/chat/send', { receiver_id: selectedUserId, message: newMessage }); setNewMessage(''); } catch (error) { console.error('Error:', error); }
    };

    const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    return (
        <>
            <SharedStyles />
            <style>{`
                .chat-container { display: flex; height: 100vh; font-family: 'IBM Plex Sans', sans-serif; font-size: 13px; }
                .chat-sidebar { width: 200px; background: #FAFBFC; border-right: 1px solid #E2E5E9; display: flex; flex-direction: column; }
                .chat-sidebar-header { padding: 10px 12px; background: #F1F5F9; border-bottom: 1px solid #E2E5E9; font-weight: 600; font-size: 0.75rem; display: flex; align-items: center; gap: 6px; color: #374151; }
                .chat-user { padding: 8px 12px; cursor: pointer; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #F3F4F6; transition: background 0.12s; }
                .chat-user:hover { background: #F3F4F6; }
                .chat-user.active { background: #CCFBF1; }
                .chat-user-name { flex: 1; font-size: 0.75rem; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .chat-user-badge { background: #EF4444; color: white; font-size: 0.5625rem; font-weight: 700; padding: 1px 5px; border-radius: 8px; }
                .chat-main { flex: 1; display: flex; flex-direction: column; background: #F3F4F6; }
                .chat-main-header { padding: 10px 16px; background: #FFFFFF; border-bottom: 1px solid #E2E5E9; font-weight: 600; font-size: 0.8125rem; display: flex; align-items: center; gap: 8px; }
                .chat-messages { flex: 1; overflow-y: auto; padding: 12px; }
                .chat-message { display: flex; margin-bottom: 8px; }
                .chat-message.sent { justify-content: flex-end; }
                .chat-message-bubble { max-width: 70%; padding: 8px 12px; border-radius: 6px; font-size: 0.8125rem; }
                .chat-message.received .chat-message-bubble { background: white; border: 1px solid #E2E5E9; }
                .chat-message.sent .chat-message-bubble { background: #0F766E; color: white; }
                .chat-message-time { font-size: 0.625rem; opacity: 0.7; margin-top: 4px; }
                .chat-message.sent .chat-message-time { text-align: right; }
                .chat-input { padding: 10px 12px; background: white; border-top: 1px solid #E2E5E9; display: flex; gap: 8px; }
                .chat-input input { flex: 1; padding: 8px 12px; border: 1px solid #D1D5DB; border-radius: 4px; font-size: 0.8125rem; font-family: inherit; }
                .chat-input input:focus { outline: none; border-color: #0F766E; }
                .chat-input button { padding: 8px 16px; background: #0F766E; color: white; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 4px; font-weight: 500; font-size: 0.75rem; }
                .chat-input button:hover { background: #0D9488; }
                .chat-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #9CA3AF; }
            `}</style>

            <div className="chat-container">
                <div className="chat-sidebar">
                    <div className="chat-sidebar-header"><Users size={14} /> Contacts</div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {users.map((user) => (
                            <div key={user.id} className={`chat-user ${selectedUserId === user.id ? 'active' : ''}`} onClick={() => handleUserClick(user.id)}>
                                <Circle size={8} fill={notifications[user.id] ? '#10B981' : '#D1D5DB'} stroke="none" />
                                <span className="chat-user-name">{user.name}</span>
                                {notifications[user.id] > 0 && <span className="chat-user-badge">{notifications[user.id]}</span>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="chat-main">
                    {selectedUserId ? (
                        <>
                            <div className="chat-main-header">
                                <MessageCircle size={16} />
                                {users.find((u) => u.id === selectedUserId)?.name}
                            </div>
                            <div className="chat-messages" ref={chatContainerRef}>
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`chat-message ${msg.sender_id === currentUserId ? 'sent' : 'received'}`}>
                                        <div className="chat-message-bubble">
                                            <div>{msg.message}</div>
                                            <div className="chat-message-time">{formatTime(msg.created_at)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="chat-input">
                                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
                                <button onClick={sendMessage}><Send size={14} /> Send</button>
                            </div>
                        </>
                    ) : (
                        <div className="chat-empty">
                            <MessageCircle size={40} />
                            <div style={{ marginTop: 8, fontSize: '0.875rem' }}>Select a contact to start chatting</div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default UserListWithChat;
