import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
    return useContext(ChatContext);
};

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [activeChat, setActiveChat] = useState(null); // { userId, name, image }
    const [isOpen, setIsOpen] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState(0);

    // Use a ref to track active chat inside socket listeners (avoids stale closures)
    const activeChatRef = useRef(null);
    useEffect(() => {
        activeChatRef.current = activeChat;
    }, [activeChat]);

    // Fetch unread count from the conversations endpoint
    const fetchUnreadCount = useCallback(async () => {
        if (!user) return;
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await fetch('http://localhost:5000/api/chat/conversations/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUnreadMessages(data.filter(c => c.unread).length);
            }
        } catch (err) {
            console.error('Failed to fetch unread message count:', err);
        }
    }, [user]);

    // Initialise unread count when user logs in / out
    useEffect(() => {
        if (user) {
            fetchUnreadCount();
        } else {
            setUnreadMessages(0);
        }
    }, [user, fetchUnreadCount]);

    useEffect(() => {
        if (!user) return;

        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('✓ Socket connected:', newSocket.id);
            newSocket.emit('join_room', user._id || user.id);
        });

        newSocket.on('disconnect', () => {
            console.log('✗ Socket disconnected');
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        newSocket.on('receive_message', (message) => {
            const current = activeChatRef.current;
            const senderId   = String(message.sender?._id   || message.sender);
            const receiverId = String(message.receiver?._id || message.receiver);
            const myId       = String(user._id || user.id);

            // Only increment unread when I am the receiver and the chat window
            // for this sender is NOT currently open
            if (receiverId === myId) {
                const isForActiveChat =
                    current &&
                    String(current.artistId || current._id || current.id) === senderId;

                if (!isForActiveChat) {
                    setUnreadMessages(prev => prev + 1);
                }
            }

            // Append to the visible message list only if it belongs to the active chat
            setMessages(prev => {
                if (!current) return prev;

                const otherId = String(current.artistId || current._id || current.id);
                const isForThisChat =
                    (senderId === otherId && receiverId === myId) ||
                    (senderId === myId   && receiverId === otherId);

                return isForThisChat ? [...prev, message] : prev;
            });
        });

        return () => newSocket.close();
    }, [user]);

    const sendMessage = async (receiverId, messageContent) => {
        if (!socket || !user) {
            console.error('Cannot send message - socket or user missing', { socket: !!socket, user: !!user });
            return;
        }

        let targetId = receiverId;

        // Resolve fake placeholder IDs like "artist_1" by fetching the real user
        if (String(targetId).startsWith('artist_')) {
            const artistName = activeChat?.artist || activeChat?.name;
            if (artistName) {
                try {
                    const resp = await fetch(`http://localhost:5000/api/auth/user/${encodeURIComponent(artistName)}`);
                    if (resp.ok) {
                        const real = await resp.json();
                        targetId = real._id;
                        setActiveChat(prev => ({ ...prev, _id: real._id }));
                    } else {
                        console.warn('Could not resolve real artist id for', artistName);
                    }
                } catch (err) {
                    console.error('Error resolving artist id', err);
                }
            }
        }

        const messageData = {
            sender:       user._id || user.id,
            receiver:     targetId,
            receiverName: activeChat?.artist || activeChat?.name || activeChat?.artistName,
            message:      messageContent,
        };

        console.log('Sending message (resolved):', messageData);
        socket.emit('send_message', messageData);
        // Optimistic update
        setMessages(prev => [...prev, { ...messageData, createdAt: new Date() }]);
    };

    // Mark all messages from a user as read via API, then refresh the count
    const markConversationRead = async (targetId) => {
        if (!targetId || String(targetId).startsWith('artist_')) return;
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            await fetch(`http://localhost:5000/api/chat/${targetId}/read`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Re-fetch the real count rather than guessing the delta
            await fetchUnreadCount();
        } catch (err) {
            console.error('Failed to mark conversation as read:', err);
        }
    };

    const openChat = async (artist) => {
        setActiveChat(artist);
        setIsOpen(true);

        if (user) {
            let targetId = artist.artistId || artist._id || artist.id;

            // If targetId is a placeholder (like "artist_1"), fetch the real artist from backend
            if (targetId && String(targetId).startsWith('artist_')) {
                try {
                    const artistName = artist.artist || artist.name;
                    if (!artistName) {
                        console.error('No artist name to lookup');
                        return;
                    }
                    console.log(`Fetching real artist ID for: ${artistName}`);
                    const response = await fetch(`http://localhost:5000/api/auth/user/${encodeURIComponent(artistName)}`);
                    if (response.ok) {
                        const realArtist = await response.json();
                        console.log('Real artist fetched:', realArtist._id);
                        targetId = realArtist._id;
                        setActiveChat(prev => ({ ...prev, _id: realArtist._id }));
                    }
                } catch (error) {
                    console.error('Failed to fetch real artist ID', error);
                    return;
                }
            }

            if (targetId) {
                // Mark this conversation's messages as read
                markConversationRead(targetId);

                // Fetch full chat history
                try {
                    const token = localStorage.getItem('token');
                    if (!token) return;
                    const historyResponse = await fetch(`http://localhost:5000/api/chat/${targetId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (historyResponse.ok) {
                        const history = await historyResponse.json();
                        setMessages(history);
                    }
                } catch (error) {
                    console.error('Failed to load chat history', error);
                }
            }
        }
    };

    const closeChat = () => {
        setIsOpen(false);
        setActiveChat(null);
    };

    const value = {
        user,
        socket,
        messages,
        sendMessage,
        activeChat,
        isOpen,
        openChat,
        closeChat,
        unreadMessages,
        fetchUnreadCount,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
