import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { X, Send, MessageCircle } from 'lucide-react';
import './ChatWindow.css';

const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ChatWindow = () => {
    const { isOpen, closeChat, activeChat, sendMessage, messages, user } = useChat();
    const [currentMessage, setCurrentMessage] = useState('');
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom whenever messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    if (!isOpen || !activeChat) return null;

    // Admin users should not have access to chat
    if (user?.role === 'admin') return null;

    const myId = user?._id || user?.id;
    const otherId = activeChat.artistId || activeChat._id || activeChat.id;

    const chatMessages = messages.filter(msg => {
        const senderId = msg.sender?._id || msg.sender;
        const receiverId = msg.receiver?._id || msg.receiver;
        return (
            (senderId === otherId || senderId === myId) &&
            (receiverId === otherId || receiverId === myId)
        );
    });

    const handleSend = (e) => {
        e.preventDefault();
        if (currentMessage.trim() && otherId) {
            sendMessage(otherId, currentMessage.trim());
            setCurrentMessage('');
        }
    };

    const chatName = activeChat.artist || activeChat.name || 'User';
    const avatarUrl =
        activeChat.artistImage ||
        activeChat.profileImage ||
        activeChat.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(chatName)}&background=d4af37&color=0a0a0a&bold=true`;

    return (
        <div className="cw-window">
            {/* ── Header ── */}
            <div className="cw-header">
                <div className="cw-header-left">
                    <div className="cw-avatar-wrap">
                        <img src={avatarUrl} alt={chatName} className="cw-avatar" />
                        <span className="cw-online-dot" />
                    </div>
                    <div>
                        <h4 className="cw-name">{chatName}</h4>
                        <span className="cw-status">Online</span>
                    </div>
                </div>
                <button onClick={closeChat} className="cw-close-btn" title="Close">
                    <X size={16} />
                </button>
            </div>

            {/* ── Messages ── */}
            <div className="cw-messages">
                {chatMessages.length === 0 ? (
                    <div className="cw-empty">
                        <MessageCircle size={36} className="cw-empty-icon" />
                        <p>Start the conversation!</p>
                        <span>Say hello to {chatName} ✨</span>
                    </div>
                ) : (
                    <>
                        <div className="cw-divider">
                            <span>Conversation started</span>
                        </div>
                        {chatMessages.map((msg, index) => {
                            const senderId = msg.sender?._id || msg.sender;
                            const isMine = senderId === myId;
                            return (
                                <div
                                    key={msg._id || index}
                                    className={`cw-bubble-row ${isMine ? 'mine' : 'theirs'}`}
                                >
                                    <div className={`cw-bubble ${isMine ? 'bubble-mine' : 'bubble-theirs'}`}>
                                        <p className="cw-text">{msg.message}</p>
                                        <span className="cw-time">{formatTime(msg.createdAt)}</span>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* ── Input ── */}
            <form onSubmit={handleSend} className="cw-input-area">
                <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Type a message…"
                    className="cw-input"
                    autoComplete="off"
                />
                <button
                    type="submit"
                    className="cw-send-btn"
                    disabled={!currentMessage.trim()}
                    title="Send"
                >
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
