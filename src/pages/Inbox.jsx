import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, User, ChevronRight } from 'lucide-react';
import './Inbox.css';

const Inbox = () => {
    const { user } = useAuth();
    const { openChat, isOpen, fetchUnreadCount } = useChat();
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

        if (user) {
            fetchConversations();
            fetchUnreadCount();
        }
    }, [user, isOpen, fetchUnreadCount]);

    if (!user) {
        navigate('/auth');
        return null;
    }

    if (loading) {
        return (
            <div className="inbox-loader">
                <div>
                    <MessageCircle size={36} />
                    <p>Loading your messages…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="inbox-page">
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* ── Page Header ── */}
                <div className="inbox-header">
                    <h1 className="inbox-title">
                        <MessageCircle size={32} className="inbox-title-icon" />
                        Messages
                    </h1>
                    <span className="inbox-subtitle">
                        {conversations.length > 0
                            ? `${conversations.length} conversation${conversations.length > 1 ? 's' : ''}`
                            : 'Your inbox is empty'}
                    </span>
                </div>

                {/* ── Conversation List Container ── */}
                <div className="inbox-container">
                    {conversations.length === 0 ? (
                        <div className="inbox-empty">
                            <MessageCircle size={56} className="inbox-empty-icon" />
                            <h3 className="inbox-empty-title">No messages yet</h3>
                            <p className="inbox-empty-text">
                                When you contact artists about their artworks, your conversations will securely appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="conversation-list">
                            {conversations.map((convo) => (
                                <div
                                    key={convo.user._id}
                                    onClick={() => openChat(convo.user)}
                                    className="conversation-item"
                                >
                                    {/* Avatar */}
                                    <div className="convo-avatar-wrapper">
                                        {convo.user.profileImage ? (
                                            <img
                                                src={convo.user.profileImage}
                                                alt={convo.user.name}
                                                className="convo-avatar"
                                            />
                                        ) : (
                                            <div className="convo-avatar-placeholder">
                                                {convo.user.name?.charAt(0).toUpperCase() || <User size={20} />}
                                            </div>
                                        )}
                                        {/* Unread Indicator */}
                                        {convo.unread && <span className="convo-unread-dot" />}
                                    </div>

                                    {/* Text Content */}
                                    <div className="convo-content">
                                        <div className="convo-header">
                                            <h3 className="convo-name">{convo.user.name}</h3>
                                            <span className="convo-time">
                                                {new Date(convo.timestamp).toLocaleDateString([], {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: new Date().getFullYear() !== new Date(convo.timestamp).getFullYear() ? 'numeric' : undefined
                                                })}
                                            </span>
                                        </div>
                                        <p className={`convo-message ${convo.unread ? 'unread' : ''}`}>
                                            {convo.lastMessage}
                                        </p>
                                    </div>

                                    {/* Action Arrow */}
                                    <ChevronRight size={20} className="convo-arrow" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Inbox;
