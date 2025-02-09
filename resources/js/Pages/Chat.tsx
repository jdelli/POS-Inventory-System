import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';

interface User {
    id: number;
    name: string;
}

interface Message {
    id: number;
    sender_id: number;
    recipient_id: number;
    message: string;
}

interface InboxProps {
    auth: { user: { id: number } };
    users?: User[];
}

export default function Inbox({ auth, users = [] }: InboxProps) {
    const webSocketChannel = `message.${auth.user.id}`;

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState("");

    const targetScrollRef = useRef<HTMLSpanElement | null>(null);
    const selectedUserRef = useRef<User | null>(null);

    const scrollToBottom = () => {
        if (targetScrollRef.current) {
            targetScrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    const sendMessage = async () => {
        if (!selectedUserRef.current) return;

        try {
            await axios.post(`/message/${selectedUserRef.current.id}`, { message: messageInput });
            setMessageInput("");
            getMessages();
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const getMessages = async () => {
        if (!selectedUserRef.current) return;

        try {
            const response = await axios.get(`/message/${selectedUserRef.current.id}`);
            setCurrentMessages(response.data);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    useEffect(() => {
        selectedUserRef.current = selectedUser;
        if (selectedUser) {
            getMessages();
        }
    }, [selectedUser]);

    useEffect(() => {
        setTimeout(() => {
            scrollToBottom();
        }, 100);
    }, [currentMessages]);

    const connectWebSocket = () => {
        if (window.Echo) {
            window.Echo.private(webSocketChannel).listen("MessageSent", async () => {
                await getMessages();
            });
        } else {
            console.error("Echo is not defined. WebSocket connection failed.");
        }
    };

    useEffect(() => {
        connectWebSocket();
        return () => {
            if (window.Echo) {
                window.Echo.leave(webSocketChannel);
            }
        };
    }, []);

    return (
        <AdminLayout>
            <Head title="Inbox" />

            <div className="h-screen flex bg-gray-100" style={{ height: "90vh" }}>
                {/* Sidebar */}
                <div className="w-1/4 bg-white border-r border-gray-200">
                    <div className="p-4 bg-gray-100 font-bold text-lg border-b border-gray-200">
                        Inbox
                    </div>
                    <div className="p-4 space-y-4">
                        {/* Contact List */}
                        {users.length > 0 ? (
                            users.map((user) => (
                                <div
                                    key={user.id}
                                    onClick={() => setSelectedUser(user)}
                                    className={`flex items-center ${
                                        user.id === selectedUser?.id ? "bg-blue-500 text-white" : ""
                                    } p-2 hover:bg-blue-500 hover:text-white rounded cursor-pointer`}
                                >
                                    <div className="w-12 h-12 bg-blue-200 rounded-full"></div>
                                    <div className="ml-4">
                                        <div className="font-semibold">{user.name}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-600">No users available</p>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex flex-col w-3/4">
                    {!selectedUser ? (
                        <div className="h-full flex justify-center items-center text-gray-800 font-bold">
                            Select a Conversation
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-200 flex items-center">
                                <div className="w-12 h-12 bg-blue-200 rounded-full"></div>
                                <div className="ml-4">
                                    <div className="font-bold">{selectedUser?.name}</div>
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                {currentMessages.length > 0 ? (
                                    currentMessages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex ${
                                                message.sender_id === auth.user.id
                                                    ? "justify-end"
                                                    : "justify-start"
                                            }`}
                                        >
                                            <div
                                                className={`${
                                                    message.recipient_id === auth.user.id
                                                        ? "bg-gray-200 text-gray-800"
                                                        : "bg-blue-500 text-white"
                                                } p-3 rounded-lg max-w-xs`}
                                            >
                                                {message.message}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-600 text-center">No messages yet</p>
                                )}
                                <span ref={targetScrollRef}></span>
                            </div>

                            {/* Message Input */}
                            <div className="p-4 bg-white border-t border-gray-200">
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                                    />
                                    <button
                                        onClick={sendMessage}
                                        className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                    >
                                        Send
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
