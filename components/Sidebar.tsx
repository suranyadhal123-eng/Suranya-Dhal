
import React from 'react';
import { ChatSession, AppConfig, CognitiveMode, PersonalityType, UserProfile } from '../types';
import { motion } from 'framer-motion';

interface SidebarProps {
  sessions: ChatSession[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  config: AppConfig;
  onConfigChange: (config: AppConfig) => void;
  onLogout: () => void;
  user: UserProfile;
  onLabAction?: (prefix: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, activeId, onSelect, onDelete, onNew, config, onConfigChange, onLogout, user
}) => {
  return (
    <aside className="w-80 bg-[#0f172a] border-r border-slate-800 flex flex-col flex-shrink-0 z-20">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tighter">OMNIMIND</h1>
        </div>
        <button 
          onClick={onNew} 
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-xl transition-all border border-blue-500/10 font-bold text-xs uppercase tracking-widest group"
        >
          <svg className="w-4 h-4 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Stream
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        <div className="px-6 mb-3 text-[10px] font-black text-slate-600 uppercase tracking-widest">Neural Streams</div>
        <div className="space-y-1">
          {sessions.map(s => (
            <div 
              key={s.id} 
              onClick={() => onSelect(s.id)} 
              className={`mx-3 px-4 py-3 flex items-center justify-between rounded-xl cursor-pointer transition-all group ${
                activeId === s.id ? 'bg-slate-800 text-white shadow-xl border border-white/5' : 'text-slate-500 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <div className={`w-1.5 h-1.5 rounded-full ${activeId === s.id ? 'bg-blue-400' : 'bg-slate-700'}`} />
                <span className="truncate text-xs font-bold">{s.title}</span>
              </div>
              {activeId === s.id && (
                <button 
                  onClick={e => { e.stopPropagation(); onDelete(s.id); }} 
                  className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-slate-900/50 space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cognitive State</label>
          <select 
            value={config.cognitiveMode} 
            onChange={e => onConfigChange({...config, cognitiveMode: e.target.value as CognitiveMode})} 
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none hover:border-blue-500/50 transition-colors cursor-pointer"
          >
            <option value="balanced">Standard OS</option>
            <option value="precise">Logical Core</option>
            <option value="creative">Neural Drift</option>
            <option value="god-mode">God Mode (Recursive)</option>
          </select>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={user.avatar} className="w-9 h-9 rounded-xl border border-white/10" alt="User" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#0f172a] rounded-full shadow-lg"></div>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[10px] font-black text-slate-200 truncate leading-tight uppercase tracking-tight">{user.name}</span>
              <span className="text-[8px] text-slate-500 font-mono">Neural ID Verified</span>
            </div>
          </div>
          <button 
            onClick={onLogout} 
            className="p-2 hover:bg-white/5 rounded-xl text-slate-600 hover:text-red-400 transition-all active:scale-90"
            title="Disconnect Link"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
};
