'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Send, User, ChevronLeft, MessageSquare, RefreshCw, Plane, Box } from 'lucide-react';
import { apiFetch } from '../../lib/clientApi';

function MessagesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [conversations, setConversations] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [currentUserId, setCurrentUserId] = useState('');

    const [sendError, setSendError] = useState('');

    const messagesEndRef = useRef(null);
    const pollingInterval = useRef(null);
    const activePartnerId = useRef(null);
    const openedContactRef = useRef(null);
    // The polling interval outlives renders, so it reads the count from a ref, not state.
    const messageCount = useRef(0);
    messageCount.current = messages.length;

    useEffect(() => {
        if (localStorage.getItem('jibli_logged_in') !== 'true') {
            router.push('/login?redirect=/messages');
            return;
        }

        loadConversationsAndMe();

        return stopPolling;
    }, []);

    // Open a specific thread when arriving from a "Contact" link (?userId=...). Runs once per
    // contact, after the first load, so that a user with no conversations can start their first.
    useEffect(() => {
        const contactUserId = searchParams.get('userId');
        if (!contactUserId || !currentUserId || contactUserId === currentUserId) return;
        if (loadingConversations || openedContactRef.current === contactUserId) return;
        openedContactRef.current = contactUserId;

        const existingConv = conversations.find(c => c.partner?._id === contactUserId);
        if (existingConv) {
            handleSelectPartner(existingConv.partner);
            return;
        }
        fetch(`/api/users/${contactUserId}`)
            .then(res => (res.ok ? res.json() : null))
            .then(partnerUser => {
                if (partnerUser) {
                    handleSelectPartner(partnerUser);
                } else {
                    setSendError('Ce contact est introuvable.');
                }
            })
            .catch(e => console.error('Error loading contact:', e));
    }, [searchParams, conversations, currentUserId, loadingConversations]);

    const loadConversationsAndMe = async ({ background = false } = {}) => {
        if (!background) setLoadingConversations(true);
        try {
            // Get current user details
            const meRes = await apiFetch('/api/auth/me');
            if (meRes.ok) {
                const meData = await meRes.json();
                setCurrentUserId(meData.user?.id || meData.user?._id);
            }

            // Get all conversations list
            const convRes = await apiFetch('/api/messages/conversations');
            if (convRes.ok) {
                const convData = await convRes.json();
                setConversations(convData);
            }
        } catch (e) {
            console.error('Error loading conversations:', e);
        } finally {
            setLoadingConversations(false);
        }
    };

    const stopPolling = () => {
        activePartnerId.current = null;
        if (pollingInterval.current) clearInterval(pollingInterval.current);
    };

    const handleSelectPartner = (partner) => {
        const partnerId = partner._id || partner.id;

        stopPolling();
        activePartnerId.current = partnerId;

        setSelectedPartner(partner);
        setMessages([]);
        setSendError('');
        loadMessages(partnerId);

        // Poll every 3 seconds to get fresh messages
        pollingInterval.current = setInterval(() => {
            refreshMessages(partnerId);
        }, 3000);
    };

    const handleClosePartner = () => {
        stopPolling();
        setSelectedPartner(null);
    };

    const loadMessages = async (partnerId) => {
        setLoadingMessages(true);
        try {
            const res = await apiFetch(`/api/messages/${partnerId}`);
            if (res.ok && activePartnerId.current === partnerId) {
                const data = await res.json();
                setMessages(data);
                scrollToBottom();
                // Mark messages as read
                apiFetch(`/api/messages/${partnerId}/read`, { method: 'PUT' });
            }
        } catch (e) {
            console.error('Error loading messages thread:', e);
        } finally {
            setLoadingMessages(false);
        }
    };

    const refreshMessages = async (partnerId) => {
        try {
            const res = await apiFetch(`/api/messages/${partnerId}`);
            // Ignore a late response for a thread the user has since left
            if (res.ok && activePartnerId.current === partnerId) {
                const data = await res.json();
                // Only touch the UI when something new arrived
                if (data.length !== messageCount.current) {
                    setMessages(data);
                    scrollToBottom();
                    apiFetch(`/api/messages/${partnerId}/read`, { method: 'PUT' });
                }
            }
        } catch (e) {
            console.error('Error refreshing messages thread:', e);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedPartner) return;

        const partnerId = selectedPartner._id || selectedPartner.id;
        const text = newMessage;
        setNewMessage('');
        setSendError('');

        try {
            const res = await apiFetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiverId: partnerId, content: text })
            });

            const data = await res.json();
            if (res.ok) {
                setMessages(prev => [...prev, data]);
                scrollToBottom();
                // Reload conversations list to show last message
                loadConversationsAndMe({ background: true });
            } else {
                // Give the text back so a failed send doesn't lose it
                setNewMessage(text);
                setSendError(data.details?.join(' ') || data.error || 'Le message n\'a pas pu être envoyé.');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setNewMessage(text);
            setSendError('Une erreur réseau s\'est produite. Veuillez réessayer.');
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
    };

    return (
        <div className="container mx-auto px-4 max-w-6xl py-6 h-[85vh] flex overflow-hidden">
            <div className="bg-white w-full h-full rounded-xl border border-neutral-200/60 shadow-md flex overflow-hidden">
                
                {/* Conversations list sidebar */}
                <div className={`w-full md:w-1/3 border-r border-neutral-100 flex flex-col justify-between ${selectedPartner ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
                        <h2 className="font-extrabold text-neutral-800 text-lg flex items-center">
                            <MessageSquare className="w-5 h-5 text-primary mr-1.5" />
                            Discussions
                        </h2>
                    </div>

                    <div className="overflow-y-auto flex-1 divide-y divide-neutral-100">
                        {loadingConversations ? (
                            <div className="p-4 text-center text-neutral-400 text-sm flex items-center justify-center space-x-2">
                                <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                                <span>Chargement...</span>
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="p-8 text-center text-neutral-400 text-sm leading-relaxed">
                                Aucune discussion ouverte pour le moment.
                            </div>
                        ) : (
                            conversations.map((c) => (
                                <div
                                    key={c._id}
                                    onClick={() => handleSelectPartner(c.partner)}
                                    className={`p-4 hover:bg-neutral-50 cursor-pointer flex gap-3 items-center transition duration-150 ${
                                        selectedPartner && (selectedPartner._id === c.partner?._id || selectedPartner.id === c.partner?.id) ? 'bg-primary/5 border-l-4 border-primary' : ''
                                    }`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-neutral-200 overflow-hidden flex-shrink-0 flex items-center justify-center border border-neutral-200">
                                        <User className="w-5 h-5 text-neutral-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-bold text-neutral-800 text-sm truncate">{c.partner?.name || 'Contact'}</h3>
                                            <span className="text-[10px] text-neutral-400">
                                                {c.lastMessage ? new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </div>
                                        <p className="text-xs text-neutral-500 truncate">{c.lastMessage?.content || ''}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat thread window */}
                {selectedPartner ? (
                    <div className={`flex-1 flex flex-col bg-neutral-50/50 ${selectedPartner ? 'flex' : 'hidden md:flex'}`}>
                        {/* Chat Header */}
                        <div className="bg-white p-4 border-b border-neutral-100 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleClosePartner}
                                    aria-label="Retour aux discussions"
                                    className="md:hidden p-1 text-neutral-500 hover:text-primary transition-colors focus:outline-none"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <div className="w-9 h-9 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    <User className="w-5 h-5 text-neutral-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-neutral-800 text-sm">{selectedPartner.name || 'Contact'}</h3>
                                </div>
                            </div>
                        </div>

                        {/* Messages panel */}
                        <div className="flex-grow overflow-y-auto p-4 space-y-4 flex flex-col">
                            {loadingMessages ? (
                                <div className="m-auto text-neutral-400 text-sm flex items-center space-x-2">
                                    <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                                    <span>Chargement de la discussion...</span>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="m-auto text-neutral-400 text-xs font-semibold uppercase tracking-wider text-center p-8 bg-neutral-100 rounded-lg max-w-xs border border-neutral-200/50">
                                    Dites bonjour ! Lancez la conversation.
                                </div>
                            ) : (
                                messages.map((m) => {
                                    const isSentByMe = m.sender?._id === currentUserId || m.sender === currentUserId;
                                    return (
                                        <div
                                            key={m._id}
                                            className={`flex flex-col max-w-[75%] ${isSentByMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                                        >
                                            <div
                                                className={`p-3 rounded-2xl text-sm ${
                                                    isSentByMe
                                                        ? 'bg-primary text-white rounded-tr-none shadow-md'
                                                        : 'bg-white text-neutral-800 border border-neutral-200/60 rounded-tl-none shadow-sm'
                                                }`}
                                            >
                                                {m.content}
                                            </div>
                                            <span className="text-[9px] text-neutral-400 mt-1 font-semibold">
                                                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input panel */}
                        <div className="bg-white p-4 border-t border-neutral-100">
                            {sendError && (
                                <p role="alert" className="text-xs text-state-error font-semibold mb-2">{sendError}</p>
                            )}
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    maxLength={1000}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Écrivez votre message..."
                                    aria-label="Votre message"
                                    className="flex-grow bg-neutral-100 border-0 rounded-full px-5 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:bg-white transition duration-150 text-neutral-800 focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    aria-label="Envoyer"
                                    className="w-10 h-10 bg-primary text-white rounded-full hover:bg-primary-hover flex items-center justify-center shadow-md active:scale-95 transition transform duration-100 focus:outline-none"
                                >
                                    <Send className="w-4.5 h-4.5" />
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    /* Desktop Empty State */
                    <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center p-8 text-neutral-400 bg-neutral-50/50">
                        <div className="w-20 h-20 bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
                            <MessageSquare className="w-10 h-10 text-neutral-300" />
                        </div>
                        <h3 className="text-lg font-bold text-neutral-700">Sélectionnez une discussion</h3>
                        <p className="max-w-xs mt-2 text-xs leading-relaxed">
                            Choisissez un contact dans la liste de gauche pour afficher l'historique des discussions.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 max-w-6xl py-6 h-[85vh] flex overflow-hidden">
                <div className="bg-white w-full h-full rounded-xl border border-neutral-200/60 shadow-md flex items-center justify-center text-neutral-400 text-sm">
                    Chargement de vos messages...
                </div>
            </div>
        }>
            <MessagesContent />
        </Suspense>
    );
}
