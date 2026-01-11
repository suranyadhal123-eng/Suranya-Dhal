
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { VoiceMode } from './components/VoiceMode';
import { LoginPortal } from './components/LoginPortal';
import { ChatSession, Message, AppConfig, UserProfile } from './types';
import { v4 as uuidv4 } from 'uuid';
import { AnimatePresence, motion } from 'framer-motion';

const DEFAULT_CONFIG: AppConfig = {
  useSearch: true,
  useMaps: true,
  thinkingBudget: 24576,
  temperature: 0.8,
  cognitiveMode: 'god-mode',
  personality: 'friendly'
};

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [externalInput, setExternalInput] = useState<string | null>(null);

  useEffect(() => {
    const savedSessions = localStorage.getItem('omnimind_sessions_v3');
    const savedUser = localStorage.getItem('omnimind_user');
    
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setSessions(parsed);
      if (parsed.length > 0) setActiveSessionId(parsed[0].id);
    } else {
      createNewSession();
    }

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('omnimind_sessions_v3', JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('omnimind_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('omnimind_user');
    }
  }, [user]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: 'Neural Stream 0x' + Math.floor(Math.random() * 9999).toString(16),
      messages: [],
      updatedAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const deleteSession = (id: string) => {
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (activeSessionId === id) {
        setActiveSessionId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  const updateSessionMessages = (sessionId: string, messages: Message[]) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        const firstUserMsg = messages.find(m => m.role === 'user');
        const title = firstUserMsg ? (firstUserMsg.content.slice(0, 24) + '...') : s.title;
        return { ...s, messages, title, updatedAt: Date.now() };
      }
      return s;
    }));
  };

  const handleLabAction = (prefix: string) => {
    setExternalInput(prefix);
  };

  const handleLogin = (profile: UserProfile) => {
    setUser(profile);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  return (
    <div className="flex h-screen bg-[#020617] text-slate-100 overflow-hidden selection:bg-blue-500/30">
      <AnimatePresence mode="wait">
        {!user ? (
          <LoginPortal onLogin={handleLogin} />
        ) : (
          <motion.div 
            key="main-app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex w-full h-full"
          >
            <Sidebar 
              sessions={sessions}
              activeId={activeSessionId}
              onSelect={setActiveSessionId}
              onDelete={deleteSession}
              onNew={createNewSession}
              config={config}
              onConfigChange={setConfig}
              onLogout={handleLogout}
              user={user}
              onLabAction={handleLabAction}
            />
            
            <main className="flex-1 flex flex-col relative h-full">
              {activeSession ? (
                <ChatInterface 
                  session={activeSession}
                  onUpdateMessages={(msgs) => updateSessionMessages(activeSession.id, msgs)}
                  config={config}
                  onOpenVoice={() => setIsVoiceMode(true)}
                  externalInput={externalInput}
                  onClearExternalInput={() => setExternalInput(null)}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4">
                  <div className="w-12 h-12 border-2 border-slate-800 rounded-full animate-spin border-t-blue-500" />
                  <p className="font-bold tracking-[0.3em] uppercase text-[10px] animate-pulse">Initializing neural synchronization...</p>
                </div>
              )}
            </main>

            <AnimatePresence>
              {isVoiceMode && (
                <VoiceMode onClose={() => setIsVoiceMode(false)} />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
