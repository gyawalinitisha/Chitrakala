import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, User } from 'lucide-react';

const Inbox = () => {
    const { user } = useAuth();
    const { openChat, isOpen } = useChat();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:5000/api/chat/conversations/all', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setConversations(data);
                }
            } catch (error) {
                console.error('Error loading inbox:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchConversations();
    }, [user, isOpen]);

    if (!user) {
        navigate('/auth');
        return null;
    }

    if (loading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#a0a0a0' }}>
                    <MessageCircle size={36} style={{ color: '#d4af37', marginBottom: '1rem' }} />
                    <p style={{ fontFamily: 'Outfit, sans-serif' }}>Loading messages…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '7rem', paddingBottom: '4rem', minHeight: '100vh' }}>
            {/* ── Page Header ── */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '2.25rem',
                    color: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    marginBottom: '0.5rem'
                }}>
                    <MessageCircle size={30} style={{ color: '#d4af37' }} />
                    Messages
                </h1>
                <p style={{ color: '#a0a0a0', fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem' }}>
                    {conversations.length > 0
                        ? `${conversations.length} conversation${conversations.length > 1 ? 's' : ''}`
                        : 'Your inbox is empty'}
                </p>
            </div>

            {/* ── Conversation List ── */}
            <div style={{
                background: '#131313',
                border: '1px solid #222',
                borderRadius: '14px',
                overflow: 'hidden',
                maxWidth: '720px',
                boxShadow: '0 16px 48px rgba(0,0,0,0.5)'
            }}>
                {conversations.length === 0 ? (
                    <div style={{
                        padding: '4rem 2rem',
                        textAlign: 'center',
                        color: '#555',
                        fontFamily: 'Outfit, sans-serif'
                    }}>
                        <MessageCircle size={48} style={{ color: 'rgba(212,175,55,0.2)', marginBottom: '1rem' }} />
                        <p style={{ fontSize: '1rem', color: '#777', marginBottom: '0.4rem' }}>No messages yet</p>
                        <p style={{ fontSize: '0.85rem', color: '#444' }}>
                            Start a conversation from an artwork page!
                        </p>
                    </div>
                ) : (
                    <div>
                        {conversations.map((convo, i) => (
                            <div
                                key={convo.user._id}
                                onClick={() => openChat(convo.user)}
                                style={{
                                    padding: '1rem 1.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    cursor: 'pointer',
                                    borderBottom: i < conversations.length - 1 ? '1px solid #1e1e1e' : 'none',
                                    transition: 'background 0.18s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                {/* Avatar */}
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                    {convo.user.profileImage ? (
                                        <img
                                            src={convo.user.profileImage}
                                            alt={convo.user.name}
                                            style={{
                                                width: 50, height: 50,
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: '2px solid #2a2a2a'
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: 50, height: 50,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg,#d4af37,#b8962e)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontFamily: 'Outfit, sans-serif',
                                            fontWeight: 700,
                                            fontSize: '1rem',
                                            color: '#0a0a0a'
                                        }}>
                                            {convo.user.name?.charAt(0).toUpperCase() || <User size={20} />}
                                        </div>
                                    )}
                                    {convo.unread && (
                                        <span style={{
                                            position: 'absolute', top: 0, right: 0,
                                            width: 12, height: 12,
                                            background: '#d4af37',
                                            borderRadius: '50%',
                                            border: '2px solid #131313'
                                        }} />
                                    )}
                                </div>

                                {/* Text */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.2rem' }}>
                                        <h3 style={{
                                            fontFamily: 'Outfit, sans-serif',
                                            fontWeight: 600,
                                            fontSize: '0.95rem',
                                            color: convo.unread ? '#f0f0f0' : '#c0c0c0',
                                            margin: 0
                                        }}>
                                            {convo.user.name}
                                        </h3>
                                        <span style={{ fontSize: '0.75rem', color: '#555', fontFamily: 'Outfit, sans-serif', flexShrink: 0 }}>
                                            {new Date(convo.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p style={{
                                        fontFamily: 'Outfit, sans-serif',
                                        fontSize: '0.85rem',
                                        color: convo.unread ? '#a0a0a0' : '#555',
                                        margin: 0,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        fontWeight: convo.unread ? 600 : 400
                                    }}>
                                        {convo.lastMessage}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Inbox;
