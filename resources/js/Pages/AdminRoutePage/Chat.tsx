import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, usePage } from '@inertiajs/react';
import apiService from '../Services/ApiService';
import echo from '../echo';
import { MessageCircle, Send, Users, Circle } from 'lucide-react';
import SharedStyles from './SharedStyles';

interface Message {
  id: number;
  sender_id: number;
  sender_name: string;
  receiver_id: number | null;
  message: string;
  created_at: string;
  is_broadcast: boolean;
}

interface User {
  id: number;
  name: string;
  usertype: string;
  is_online: boolean;
}

const Chat: React.FC = () => {
  const { auth } = usePage().props as { auth: { user: { id: number; name: string } } };
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiService.get('/users');
        setUsers(response.data.filter((u: User) => u.id !== auth.user.id));
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();

    echo.channel('user-status').listen('.UserStatusUpdated', (data: { userId: number; status: boolean }) => {
      setUsers((prev) => prev.map((u) => u.id === data.userId ? { ...u, is_online: data.status } : u));
    });

    return () => echo.leave('user-status');
  }, [auth.user.id]);

  useEffect(() => {
    if (!selectedUser) {
      fetchBroadcastMessages();
    } else {
      fetchPrivateMessages(selectedUser.id);
    }
  }, [selectedUser]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    const channel = echo.private(`chat.${auth.user.id}`);
    channel.listen('.new-message', (data: Message) => {
      if (!selectedUser && data.is_broadcast) {
        setMessages((prev) => [...prev, data]);
      } else if (selectedUser && data.sender_id === selectedUser.id) {
        setMessages((prev) => [...prev, data]);
      }
    });
    return () => echo.leave(`chat.${auth.user.id}`);
  }, [auth.user.id, selectedUser]);

  const fetchBroadcastMessages = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/messages/broadcast');
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching broadcast messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrivateMessages = async (userId: number) => {
    setLoading(true);
    try {
      const response = await apiService.get(`/messages/${userId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching private messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      await apiService.post('/messages', {
        receiver_id: selectedUser?.id || null,
        message: newMessage,
        is_broadcast: !selectedUser
      });
      setNewMessage('');
      if (selectedUser) {
        fetchPrivateMessages(selectedUser.id);
      } else {
        fetchBroadcastMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Chat</h2>}>
      <Head title="Chat" />
      <SharedStyles />

      <div className="admin-page">
        <div className="page-header">
          <h1 className="page-title"><MessageCircle size={20} />Chat</h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', height: 'calc(100vh - 180px)' }}>
          {/* Sidebar */}
          <div className="panel" style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
            <div className="panel-header"><Users size={14} />Contacts</div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <div
                onClick={() => setSelectedUser(null)}
                style={{
                  padding: '0.5rem 0.75rem',
                  cursor: 'pointer',
                  background: !selectedUser ? '#DBEAFE' : 'transparent',
                  borderBottom: '1px solid #E5E7EB',
                  fontWeight: !selectedUser ? 600 : 400,
                  fontSize: '0.8125rem'
                }}
              >
                <MessageCircle size={14} style={{ display: 'inline', marginRight: 6 }} />
                Broadcast
              </div>
              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    cursor: 'pointer',
                    background: selectedUser?.id === user.id ? '#DBEAFE' : 'transparent',
                    borderBottom: '1px solid #E5E7EB',
                    fontWeight: selectedUser?.id === user.id ? 600 : 400,
                    fontSize: '0.8125rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Circle size={8} fill={user.is_online ? '#10B981' : '#D1D5DB'} stroke="none" />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
                  <span className="badge badge-gray" style={{ fontSize: '0.625rem' }}>{user.usertype}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="panel-header">
              <MessageCircle size={14} />
              {selectedUser ? selectedUser.name : 'Broadcast Messages'}
              {selectedUser && (
                <span className="badge badge-gray" style={{ marginLeft: 'auto' }}>{selectedUser.usertype}</span>
              )}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', background: '#F9FAFB' }}>
              {loading ? (
                <div className="loading"><div className="spinner"></div>Loading...</div>
              ) : messages.length > 0 ? (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: msg.sender_id === auth.user.id ? 'flex-end' : 'flex-start',
                      marginBottom: '0.5rem'
                    }}
                  >
                    <div style={{
                      maxWidth: '70%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '4px',
                      background: msg.sender_id === auth.user.id ? '#1D4ED8' : '#FFFFFF',
                      color: msg.sender_id === auth.user.id ? 'white' : '#374151',
                      border: msg.sender_id === auth.user.id ? 'none' : '1px solid #E5E7EB',
                      fontSize: '0.8125rem'
                    }}>
                      {msg.sender_id !== auth.user.id && (
                        <div style={{ fontWeight: 600, fontSize: '0.6875rem', color: msg.sender_id === auth.user.id ? 'rgba(255,255,255,0.8)' : '#1D4ED8', marginBottom: '0.125rem' }}>
                          {msg.sender_name}
                        </div>
                      )}
                      <div>{msg.message}</div>
                      <div style={{ fontSize: '0.625rem', textAlign: 'right', opacity: 0.7, marginTop: '0.25rem' }}>{formatTime(msg.created_at)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state"><MessageCircle size={32} /><div className="empty-state-text">No messages yet</div></div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div style={{ padding: '0.75rem', borderTop: '1px solid #E5E7EB', display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-control"
                placeholder={selectedUser ? `Message ${selectedUser.name}...` : 'Broadcast message...'}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={handleSend}><Send size={14} /></button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Chat;
