
import React, { useState, useRef, useEffect } from 'react';
import { ChatSession, Message, AppConfig } from '../types';
import { sendMessage, generateImage, generateVideo } from '../services/gemini';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInterfaceProps {
  session: ChatSession;
  onUpdateMessages: (messages: Message[]) => void;
  config: AppConfig;
  onOpenVoice: () => void;
  externalInput: string | null;
  onClearExternalInput: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  session, onUpdateMessages, config, onOpenVoice, externalInput, onClearExternalInput 
}) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingText, setLoadingText] = useState('OmniMind is thinking...');
  const [attachedFiles, setAttachedFiles] = useState<{url: string, type: string}[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [session.messages, isProcessing]);

  useEffect(() => {
    if (externalInput !== null) {
      setInput(externalInput);
      inputRef.current?.focus();
      onClearExternalInput();
    }
  }, [externalInput]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedFiles(prev => [...prev, { 
          url: reader.result as string, 
          type: file.type.startsWith('image/') ? 'image' : 'video' 
        }]);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsMenuOpen(false);
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const triggerUpload = (type: 'photo' | 'video' | 'any') => {
    if (!fileInputRef.current) return;
    if (type === 'photo') fileInputRef.current.accept = 'image/*';
    else if (type === 'video') fileInputRef.current.accept = 'video/*';
    else fileInputRef.current.accept = 'image/*,video/*,application/pdf';
    fileInputRef.current.click();
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && attachedFiles.length === 0) || isProcessing) return;

    const currentInput = input;
    const isVideoGeneration = currentInput.toLowerCase().startsWith('/video ');
    
    if (isVideoGeneration) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        if (window.confirm("Veo high-quality video generation requires a paid API key. Select one?")) {
          await (window as any).aistudio.openSelectKey();
        } else return;
      }
    }

    const userMsg: Message = {
      id: uuidv4(),
      role: 'user',
      content: currentInput,
      timestamp: Date.now(),
      type: 'text',
      attachments: attachedFiles.map(f => f.url)
    };

    const newMessages = [...session.messages, userMsg];
    onUpdateMessages(newMessages);
    setInput('');
    setAttachedFiles([]);
    setIsProcessing(true);

    try {
      if (isVideoGeneration) {
        const videoUrl = await generateVideo(currentInput.slice(7), setLoadingText);
        onUpdateMessages([...newMessages, {
          id: uuidv4(), role: 'assistant', content: `Temporal synthesis complete: "${currentInput.slice(7)}"`,
          timestamp: Date.now(), type: 'video', videoUri: videoUrl
        }]);
      } else if (currentInput.toLowerCase().startsWith('/image ')) {
        setLoadingText("Synthesizing Visual Manifestation...");
        const imageUrl = await generateImage(currentInput.slice(7));
        onUpdateMessages([...newMessages, {
          id: uuidv4(), role: 'assistant', content: `Visual representation complete.`,
          timestamp: Date.now(), type: 'image', attachments: imageUrl ? [imageUrl] : []
        }]);
      } else {
        setLoadingText("Accessing Neural Knowledge...");
        const assistantId = uuidv4();
        const initialAiMsg: Message = { id: assistantId, role: 'assistant', content: '', timestamp: Date.now(), type: 'text' };
        onUpdateMessages([...newMessages, initialAiMsg]);
        const result = await sendMessage(newMessages, config, (chunk) => {
          onUpdateMessages([...newMessages, { ...initialAiMsg, content: chunk }]);
        });
        onUpdateMessages([...newMessages, { ...initialAiMsg, content: result.text, groundingMetadata: result.groundingMetadata }]);
      }
    } catch (err: any) {
      onUpdateMessages([...newMessages, { id: uuidv4(), role: 'system', content: 'Connection severed. Check neural link.', timestamp: Date.now(), type: 'text' }]);
    } finally { setIsProcessing(false); }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#020617] relative">
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950/40 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-pulse" />
          <span className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase">LINK STATUS: OPTIMIZED</span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={onOpenVoice} 
            className="group flex items-center gap-2 px-4 py-1.5 rounded-xl border border-blue-500/20 hover:border-blue-500/50 transition-all text-[10px] font-black uppercase text-slate-400 hover:text-blue-400"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:animate-ping" />
            Voice Portal
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-12 space-y-10 z-10 scrollbar-hide">
        {session.messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-12">
            <div className="relative">
              <div className="absolute -inset-10 bg-blue-600/10 blur-3xl rounded-full" />
              <div className="relative w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center border border-slate-800 shadow-2xl mx-auto">
                <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tight text-white uppercase italic">Neural Sync Complete</h1>
              <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-md mx-auto">
                OmniMind is active. Use the <b>plus sign</b> to sync photos, videos, or documents to the neural core.
              </p>
            </div>
          </div>
        )}

        {session.messages.map((msg) => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] p-6 rounded-3xl relative ${
              msg.role === 'user' ? 'bg-blue-600 text-white shadow-2xl rounded-tr-none' : 'glass text-slate-200 rounded-tl-none border-white/5 shadow-2xl'
            }`}>
              {msg.type === 'video' && msg.videoUri && (
                <video src={msg.videoUri} controls className="relative w-full rounded-2xl border border-white/10 shadow-2xl mb-4" />
              )}
              {msg.attachments?.map((a, idx) => (
                <div key={idx} className="mb-4">
                  {a.startsWith('data:image') ? (
                    <img src={a} className="w-full rounded-2xl border border-white/10 shadow-xl" alt="Neural Context" />
                  ) : (
                    <video src={a} className="w-full rounded-2xl border border-white/10 shadow-xl" controls />
                  )}
                </div>
              ))}
              <div className="whitespace-pre-wrap text-[15px] leading-relaxed font-medium tracking-tight">
                {msg.content}
              </div>
            </div>
          </motion.div>
        ))}

        {isProcessing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="glass p-6 rounded-3xl flex flex-col gap-4 min-w-[320px] rounded-tl-none">
              <div className="flex items-center gap-3">
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{loadingText}</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-8 bg-gradient-to-t from-[#020617] via-[#020617] to-transparent z-20">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
          
          <AnimatePresence>
            {attachedFiles.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute bottom-full left-0 mb-4 flex flex-wrap gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl z-30"
              >
                {attachedFiles.map((file, idx) => (
                  <div key={idx} className="relative group">
                    {file.type === 'image' ? (
                      <img src={file.url} className="w-20 h-20 object-cover rounded-xl border border-white/10" alt="Preview" />
                    ) : (
                      <div className="w-20 h-20 bg-slate-800 rounded-xl flex items-center justify-center border border-white/10">
                        <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                    )}
                    <button 
                      type="button" 
                      onClick={() => removeFile(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative bg-slate-900/90 border border-slate-800 rounded-[2rem] p-2 flex items-end gap-2 shadow-2xl backdrop-blur-3xl focus-within:border-blue-500/30 transition-all">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              multiple 
              className="hidden" 
            />
            
            <div className="relative" ref={menuRef}>
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="absolute bottom-full left-0 mb-4 bg-[#0f172a] border border-slate-800 p-2 rounded-3xl shadow-2xl w-48 overflow-hidden z-40 backdrop-blur-2xl"
                  >
                    {[
                      { icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', label: 'Sync Photos', color: 'text-blue-400', action: () => triggerUpload('photo') },
                      { icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', label: 'Sync Videos', color: 'text-indigo-400', action: () => triggerUpload('video') },
                      { icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', label: 'Neural Files', color: 'text-emerald-400', action: () => triggerUpload('any') },
                    ].map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={opt.action}
                        className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-2xl transition-all text-left group"
                      >
                        <svg className={`w-5 h-5 ${opt.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={opt.icon} />
                        </svg>
                        <span className="text-xs font-bold text-slate-300 group-hover:text-white">{opt.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                type="button" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-4 transition-all rounded-2xl hover:bg-white/5 ${isMenuOpen ? 'text-blue-400 rotate-45 scale-110' : 'text-slate-500 hover:text-blue-400'}`}
                title="Open Neural Hub"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            <textarea 
              ref={inputRef}
              rows={1} 
              value={input} 
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="OmniMind initialized. Command me..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-white py-4 px-2 resize-none text-[16px] placeholder:text-slate-700 scrollbar-hide"
            />
            <button 
              type="submit" 
              disabled={isProcessing || (!input.trim() && attachedFiles.length === 0)} 
              className={`p-4 rounded-2xl transition-all ${
                (input.trim() || attachedFiles.length > 0) && !isProcessing 
                ? 'bg-blue-600 text-white shadow-xl hover:scale-105 active:scale-95' 
                : 'bg-slate-800 text-slate-600'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
