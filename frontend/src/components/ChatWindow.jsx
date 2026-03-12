import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic } from 'lucide-react';
import { streamRoast, startNewChat, fetchChatHistory } from '../api/chat';

/* Skeleton row while loading */
function SkeletonMsg({ isUser }) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && <div className="w-8 h-8 mr-2 rounded-xl skeleton flex-shrink-0" />}
      <div className="space-y-2 w-52">
        <div className="skeleton h-5 rounded-lg" />
        <div className="skeleton h-5 rounded-lg w-3/4" />
      </div>
    </div>
  );
}

/* Burn fuse typing indicator */
function FuseTyping({ persona }) {
  return (
    <motion.div
      className="flex items-start gap-2 mb-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
    >
      <div className="w-8 h-8 btn-plasma rounded-xl flex items-center justify-center flex-shrink-0">
        <Mic size={13} className="text-white" />
      </div>
      <div className="liquid-raised px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
        <div className="fuse-dot animate-fuse1" />
        <div className="fuse-dot animate-fuse2" />
        <div className="fuse-dot animate-fuse3" />
        <span className="text-sm text-gray-200 ml-2 font-mono capitalize">{persona} loading…</span>
      </div>
    </motion.div>
  );
}

function ChatBubble({ role, content, persona }) {
  const isUser = role === 'user';

  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {!isUser && (
        <div className="w-10 h-10 btn-plasma rounded-xl flex items-center justify-center flex-shrink-0 mr-3 mt-0.5">
          <Mic size={16} className="text-white" />
        </div>
      )}
      <div className={`max-w-[85%] sm:max-w-[80%] ${!isUser && 'flex flex-col sm:flex-row gap-3 sm:gap-4 items-start'}`}>
        <div className="flex-1">
          {!isUser && (
            <span className="text-sm font-bold text-heat mb-1 block capitalize tracking-wider font-mono">
              {persona}
            </span>
          )}
          <div
            className={`px-5 py-4 rounded-2xl text-base leading-relaxed whitespace-pre-wrap shadow-lg ${
              isUser ? 'bubble-user rounded-br-sm text-gray-100' : 'bubble-ai rounded-bl-sm text-gray-100 font-medium'
            }`}
          >
            {content || (!isUser && <span className="text-gray-400 cursor-blink font-mono">▌</span>)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ChatWindow({ persona, mode }) {
  const [chats, setChats]           = useState({});
  const [input, setInput]           = useState('');
  const [streaming, setStreaming]   = useState(false);
  const [shake, setShake]           = useState(false);
  
  // Ref to track if we're currently initializing a chat so we don't double-call
  const initializingRef = useRef({});
  
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const containerRef = useRef(null);

  const currentChat = chats[persona] || { messages: [], usedAngles: [], conversationId: null };
  const messages = currentChat.messages;
  const usedAngles = currentChat.usedAngles;
  const conversationId = currentChat.conversationId;

  // Initialize or restore a backend conversation when this persona is opened
  useEffect(() => {
    async function initOrRestoreChat() {
      if (conversationId || initializingRef.current[persona]) return;

      initializingRef.current[persona] = true;
      try {
        const userEmail = localStorage.getItem('user_email') || 'anonymous';

        // 1. Try to restore last conversation + messages from the backend
        const historyRes = await fetchChatHistory(userEmail, persona, 10);
        let convId = historyRes.conversation_id || null;
        let historyMessages = Array.isArray(historyRes.messages) ? historyRes.messages : [];

        // 2. If no previous conversation, start a fresh one
        if (!convId) {
          const data = await startNewChat(userEmail, persona);
          convId = data.conversation_id || null;
        }

        setChats(prev => {
          const existing = prev[persona] || { messages: [], usedAngles: [] };
          const hydratedMessages = historyMessages.map((m, idx) => ({
            id: `${Date.now()}-${idx}`,
            role: m.role,
            content: m.content || '',
            persona_id: m.persona_id || persona,
          }));

          return {
            ...prev,
            [persona]: {
              ...existing,
              conversationId: convId,
              // Only hydrate messages if we didn't already have any locally (fresh load)
              messages: existing.messages.length ? existing.messages : hydratedMessages,
            },
          };
        });
      } catch (err) {
        console.error('Failed to initialize chat:', err);
      } finally {
        initializingRef.current[persona] = false;
      }
    }

    initOrRestoreChat();
  }, [persona, conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  const history = messages
    .slice(-10)
    .map(m => ({ role: m.role, content: m.content || '' }));

  const isInitializing = !conversationId || initializingRef.current[persona];

  async function handleSend(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || streaming || isInitializing) return;

    const userMsg   = { role: 'user',      content: text, id: Date.now(),     persona_id: persona };
    const typingMsg = { role: 'assistant', content: '',   id: Date.now() + 1, persona_id: persona };

    setChats(prev => {
      const current = prev[persona] || { messages: [], usedAngles: [] };
      return { ...prev, [persona]: { ...current, messages: [...current.messages, userMsg, typingMsg] } };
    });
    
    setInput('');
    setStreaming(true);

    let accumulated = '';

    await streamRoast({
      message: text, persona, mode, history, usedAngles, conversationId,
      onChunk(chunk) {
        accumulated += chunk;
        setChats(prev => {
          const current = prev[persona];
          return {
            ...prev,
            [persona]: {
              ...current,
              messages: current.messages.map(m => m.id === typingMsg.id ? { ...m, content: accumulated } : m)
            }
          };
        });
      },
      onAngleUsed(angle) {
        setChats(prev => {
          const current = prev[persona];
          const u = [...current.usedAngles, angle];
          return {
            ...prev,
            [persona]: {
              ...current,
              usedAngles: u.length > 10 ? u.slice(-10) : u
            }
          };
        });
      },
      onDone(fullText) {
        setChats(prev => {
          const current = prev[persona];
          return {
            ...prev,
            [persona]: {
              ...current,
              messages: current.messages.map(m =>
                m.id === typingMsg.id
                  ? { ...m, content: fullText }
                  : m
              )
            }
          };
        });
        
        setStreaming(false);
        inputRef.current?.focus();
      },
      onError(err) {
        setChats(prev => {
          const current = prev[persona];
          return {
            ...prev,
            [persona]: {
              ...current,
              messages: current.messages.map(m => m.id === typingMsg.id ? { ...m, content: `[Error: ${err}]` } : m)
            }
          };
        });
        setStreaming(false);
      },
    });
  }

  const lastMsgIsEmptyAI = messages.length > 0 &&
    messages[messages.length - 1].role === 'assistant' &&
    !messages[messages.length - 1].content &&
    streaming;

  return (
    <motion.div
      ref={containerRef}
      className="flex flex-col h-full overflow-hidden"
      animate={shake ? { x: [-5, 5, -4, 4, -2, 2, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 pb-12">
        {messages.length === 0 && (
          <motion.div
            className="flex flex-col items-center justify-center min-h-[320px] text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-20 h-20 btn-plasma rounded-3xl flex items-center justify-center mx-auto mb-6"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              <Mic size={40} className="text-white" />
            </motion.div>
            <h3 className="font-display font-black text-5xl text-white/90 mb-4">The Hot Seat</h3>
            <p className="text-gray-300 text-lg max-w-[320px] font-medium leading-relaxed">
              Choose a celebrity, choose a mode, then say anything.
            </p>
          </motion.div>
        )}

        {messages.map((msg, i) => {
          if (msg.id === messages[messages.length - 1]?.id && lastMsgIsEmptyAI) {
            return <FuseTyping key="fuse" persona={persona} />;
          }
          return (
            <ChatBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              persona={persona}
            />
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 px-4 sm:px-8 py-5 border-t border-white/5 liquid-glass z-10">
        <form onSubmit={handleSend} className="flex items-center gap-4">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={streaming || isInitializing}
            placeholder={streaming ? `${persona} is loading…` : isInitializing ? 'Preparing the stage…' : 'Say something worth roasting…'}
            className="flex-1 bg-base border border-white/8 rounded-2xl px-6 py-4 text-white placeholder-gray-400 text-base focus:border-heat focus:outline-none transition-colors disabled:opacity-50 font-medium"
          />
          <motion.button
            type="submit"
            disabled={streaming || !input.trim() || isInitializing}
            className="btn-plasma w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send size={20} className="text-white" />
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
