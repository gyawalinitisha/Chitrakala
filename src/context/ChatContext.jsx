import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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

    useEffect(() => {
        if (user) {
            // Connect to backend
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

            /* 
               CRITICAL FIX: Only append messages if they belong to the ACTIVE chat.
               Otherwise, just let them be fetched when the user opens that chat later.
               Optional: Add a "notification" badge logic here later.
            */
            newSocket.on('receive_message', (message) => {
                // Use the ref so we always have the current active chat without stale closure
                setMessages((prev) => {
                    const current = activeChatRef.current;
                    if (!current) {
                        console.log('No active chat, ignoring message:', message);
                        return prev;
                    }
                    
                    const otherId = current.artistId || current._id || current.id;
                    const senderId = message.sender?._id || message.sender;
                    const receiverId = message.receiver?._id || message.receiver;
                    const myId = user._id || user.id;
                    
                    console.log('Received message:', { senderId, receiverId, myId, otherId });
                    
                    // Check if this message is for the current conversation
                    const isForThisChat = 
                        (senderId === otherId && receiverId === myId) ||
                        (senderId === myId && receiverId === otherId);
                    
                    if (isForThisChat) {
                        console.log('Message added to current chat');
                        return [...prev, message];
                    }
                    
                    console.log('Message is not for current chat');
                    return prev;
                });
            });

            return () => newSocket.close();
        }
    }, [user]);

    // Use a ref to track active chat for the socket listener to check against without re-binding
    const activeChatRef = useRef(null);
    useEffect(() => {
        activeChatRef.current = activeChat;
    }, [activeChat]);

    // Re-bind listener to properly filter? No, standard way is to filter in UI or use a Ref.
    // Let's keep it simple: Append to global messages, but ChatWindow filters what it shows.
    // AND fetchHistory overwrites 'messages'.

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
                        // Update activeChat so UI reflects real id
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
            sender: user._id || user.id,
            receiver: targetId,
            receiverName: activeChat?.artist || activeChat?.name || activeChat?.artistName,
            message: messageContent,
        };

        console.log('Sending message (resolved):', messageData);
        socket.emit('send_message', messageData);
        // Optimistic update
        setMessages((prev) => [...prev, { ...messageData, createdAt: new Date() }]);
    };

    const openChat = async (artist) => {
        setActiveChat(artist);
        setIsOpen(true);

        // Fetch real history and get real artist ID if needed
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
                        // Update activeChat with real ID
                        setActiveChat(prev => ({ ...prev, _id: realArtist._id }));
                    }
                } catch (error) {
                    console.error("Failed to fetch real artist ID", error);
                    return;
                }
            }
            
            // Now fetch chat history with the correct ID
            if (targetId) {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) return;

                    const historyResponse = await fetch(`http://localhost:5000/api/chat/${targetId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (historyResponse.ok) {
                        const history = await historyResponse.json();
                        setMessages(history);
                    }
                } catch (error) {
                    console.error("Failed to load chat history", error);
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
        closeChat
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
