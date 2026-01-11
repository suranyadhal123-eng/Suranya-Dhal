
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '../types';

interface LoginPortalProps {
  onLogin: (profile: UserProfile) => void;
}

const MOCK_GOOGLE_ACCOUNTS: UserProfile[] = [
  { 
    name: 'Alexander Pierce', 
    email: 'a.pierce@gmail.com', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alexander' 
  },
  { 
    name: 'Sarah Jenkins', 
    email: 's.jenkins.dev@gmail.com', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' 
  },
  { 
    name: 'Omni Workspace', 
    email: 'admin@omnimind-corp.io', 
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Work' 
  }
];

export const LoginPortal: React.FC<LoginPortalProps> = ({ onLogin }) => {
  const [view, setView] = useState<'protocol' | 'scanning' | 'google-picker' | 'syncing'>('protocol');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const startGoogleScan = () => {
    setView('scanning');
    // Simulate searching the device for accounts
    setTimeout(() => {
      setView('google-picker');
    }, 2000);
  };

  const startSync = (profile: UserProfile) => {
    setSelectedUser(profile);
    setView('syncing');
    
    // Final synchronization delay for neural link
    setTimeout(() => {
      onLogin(profile);
    }, 2800);
  };

  const containerVariants = {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 1.05, y: -10 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020617] overflow-hidden"
    >
      {/* Immersive Background Visuals */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-600/5 blur-[200px] rounded-full animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10 max-w-md w-full px-6">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <div className="w-20 h-20 relative group">
             <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
             <div className="relative w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[2rem] flex items-center justify-center border border-white/20 shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mt-2">OMNIMIND</h1>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            <p className="text-blue-400 font-bold text-[9px] tracking-[0.4em] uppercase opacity-70">Neural Identity Service</p>
          </div>
        </motion.div>

        <div className="w-full min-h-[400px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {view === 'protocol' && (
              <motion.div 
                key="protocol"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="glass w-full p-8 rounded-[2.5rem] border border-white/10 space-y-4 shadow-2xl"
              >
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest text-center mb-6">Access Protocol</h3>
                
                <button 
                  onClick={startGoogleScan}
                  className="w-full py-4 rounded-2xl bg-white text-slate-900 font-bold text-sm tracking-tight transition-all flex items-center justify-center gap-3 hover:bg-slate-100 active:scale-[0.98] shadow-lg"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                  <div className="relative flex justify-center text-[10px]"><span className="bg-[#0f172a] px-3 text-slate-600 font-bold uppercase tracking-widest">or direct link</span></div>
                </div>

                <button 
                  onClick={() => startSync({ name: 'Neural Admin', email: 'root@omnimind.io', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Root' })}
                  className="w-full py-4 rounded-2xl bg-blue-600/10 border border-blue-500/10 text-blue-400 font-bold text-sm tracking-widest uppercase transition-all hover:bg-blue-600/20 active:scale-[0.98]"
                >
                  Administrator Entry
                </button>
              </motion.div>
            )}

            {view === 'scanning' && (
              <motion.div 
                key="scanning"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex flex-col items-center justify-center gap-6"
              >
                <div className="relative flex items-center justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-2 border-white/5 border-t-blue-500 rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <svg className="w-6 h-6 text-blue-500 animate-pulse" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/>
                     </svg>
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">Scanning Device...</h3>
                  <p className="text-[10px] text-slate-500 font-mono italic">Locating local neural identities</p>
                </div>
              </motion.div>
            )}

            {view === 'google-picker' && (
              <motion.div 
                key="google-picker"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="glass w-full p-6 rounded-[2.5rem] border border-white/10 space-y-4 shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4 px-2">
                  <button onClick={() => setView('protocol')} className="text-slate-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="flex flex-col items-center">
                    <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <h3 className="text-sm font-bold text-white tracking-tight">Choose an account</h3>
                    <p className="text-[10px] text-slate-500 font-medium tracking-tight">to continue to OmniMind</p>
                  </div>
                  <div className="w-5" />
                </div>

                <div className="space-y-1 max-h-[280px] overflow-y-auto pr-1 scrollbar-hide">
                  {MOCK_GOOGLE_ACCOUNTS.map((acc, idx) => (
                    <motion.button
                      key={acc.email}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => startSync(acc)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all text-left border border-transparent hover:border-white/10 group"
                    >
                      <img src={acc.avatar} alt={acc.name} className="w-10 h-10 rounded-full border border-white/10" />
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors truncate">{acc.name}</p>
                        <p className="text-xs text-slate-500 truncate">{acc.email}</p>
                      </div>
                    </motion.button>
                  ))}
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: MOCK_GOOGLE_ACCOUNTS.length * 0.1 }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all text-left border border-transparent hover:border-white/10 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-dashed border-white/20">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">Use another account</p>
                  </motion.button>
                </div>

                <div className="pt-4 text-center border-t border-white/5">
                  <p className="text-[9px] text-slate-600 leading-relaxed font-medium">
                    To continue, Google will share your identity with the OmniMind Neural Core. 
                    Manage your data at <span className="text-blue-500/50 underline cursor-pointer">omnimind.io/privacy</span>.
                  </p>
                </div>
              </motion.div>
            )}

            {view === 'syncing' && (
              <motion.div 
                key="syncing"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                className="flex flex-col items-center gap-10 py-12"
              >
                <div className="relative flex items-center justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-28 h-28 border-2 border-transparent border-t-blue-500 border-r-blue-500/20 rounded-full shadow-[0_0_40px_rgba(59,130,246,0.2)]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img src={selectedUser?.avatar} className="w-14 h-14 rounded-full border border-white/20 shadow-2xl animate-pulse" alt="User Avatar" />
                  </div>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-white tracking-tight">NEURAL LINK ESTABLISHING</h3>
                    <p className="text-[10px] text-blue-500/70 font-mono tracking-widest">{selectedUser?.email.toUpperCase()}</p>
                  </div>
                  
                  <div className="w-56 h-1 bg-white/5 rounded-full overflow-hidden mx-auto">
                    <motion.div 
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2.5, ease: "easeInOut" }}
                      className="bg-blue-500 h-full"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">Syncing Universal Graph</span>
                    <span className="text-[8px] font-mono text-slate-700 italic">calibrating core.os_v3.1...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="mt-auto pt-10 flex justify-center gap-6">
            <span className="text-[9px] text-slate-800 font-bold uppercase tracking-widest hover:text-slate-600 cursor-pointer transition-colors">Privacy Protocol</span>
            <span className="text-[9px] text-slate-800 font-bold uppercase tracking-widest hover:text-slate-600 cursor-pointer transition-colors">Neural Terms</span>
            <span className="text-[9px] text-slate-800 font-bold uppercase tracking-widest hover:text-slate-600 cursor-pointer transition-colors">Legal Matrix</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
