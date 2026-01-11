import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceModeProps {
  onClose: () => void;
}

export const VoiceMode: React.FC<VoiceModeProps> = ({ onClose }) => {
  const [status, setStatus] = useState<'connecting' | 'listening' | 'speaking' | 'error'>('connecting');
  const [transcript, setTranscript] = useState('');
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  useEffect(() => {
    let active = true;

    const startSession = async () => {
      try {
        // Fixed: Use process.env.API_KEY directly as per guidelines
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-12-2025',
          config: {
            responseModalities: [Modality.AUDIO],
            outputAudioTranscription: {},
            inputAudioTranscription: {},
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
            },
            systemInstruction: 'You are OmniMind. Your voice is warm, sophisticated, and deeply intelligent. You are here to help the user via live conversation.'
          },
          callbacks: {
            onopen: () => {
              setStatus('listening');
              const source = inputContext.createMediaStreamSource(stream);
              const scriptProcessor = inputContext.createScriptProcessor(4096, 1, 1);
              
              scriptProcessor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const l = inputData.length;
                const int16 = new Int16Array(l);
                for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
                
                sessionPromise.then(session => {
                  session.sendRealtimeInput({
                    media: {
                      data: encode(new Uint8Array(int16.buffer)),
                      mimeType: 'audio/pcm;rate=16000'
                    }
                  });
                });
              };

              source.connect(scriptProcessor);
              scriptProcessor.connect(inputContext.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
              if (message.serverContent?.outputTranscription) {
                setTranscript(message.serverContent.outputTranscription.text);
              }

              const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
              if (base64Audio && audioContextRef.current) {
                setStatus('speaking');
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
                const buffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
                
                const source = audioContextRef.current.createBufferSource();
                source.buffer = buffer;
                source.connect(audioContextRef.current.destination);
                
                // Fixed: Use addEventListener for 'ended' event as per Live API examples
                source.addEventListener('ended', () => {
                  sourcesRef.current.delete(source);
                  if (sourcesRef.current.size === 0) setStatus('listening');
                });

                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;
                sourcesRef.current.add(source);
              }

              if (message.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => s.stop());
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
                setStatus('listening');
              }
            },
            onerror: (e) => {
              console.error("Live Error", e);
              setStatus('error');
            },
            onclose: () => {
              if (active) onClose();
            }
          }
        });

        sessionRef.current = await sessionPromise;
      } catch (err) {
        console.error(err);
        setStatus('error');
      }
    };

    startSession();

    return () => {
      active = false;
      if (sessionRef.current) sessionRef.current.close();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [onClose]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-[40px] transition-all"
    >
      <div className="absolute top-10 right-10">
        <button 
          onClick={onClose} 
          className="p-4 text-slate-400 hover:text-white rounded-full bg-white/5 border border-white/10 transition-all hover:scale-110 active:scale-95"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col items-center gap-16 max-w-2xl text-center px-10">
        <div className="relative flex items-center justify-center">
          {/* Layered Pulsing Orbs */}
          <motion.div 
            animate={{ scale: status === 'speaking' ? [1, 1.4, 1] : 1, opacity: status === 'speaking' ? [0.1, 0.3, 0.1] : 0.1 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute w-96 h-96 bg-blue-500 rounded-full blur-[80px]"
          />
          <motion.div 
            animate={{ scale: status === 'listening' ? [1, 1.2, 1] : 1, opacity: status === 'listening' ? [0.1, 0.2, 0.1] : 0.1 }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute w-80 h-80 bg-emerald-500 rounded-full blur-[60px]"
          />
          
          <div className={`relative w-64 h-64 rounded-full border-2 flex items-center justify-center transition-all duration-700 ${
            status === 'speaking' ? 'border-blue-400 scale-110 shadow-[0_0_80px_rgba(59,130,246,0.3)]' : 
            status === 'listening' ? 'border-emerald-400 shadow-[0_0_80px_rgba(16,185,129,0.2)]' : 'border-slate-800'
          }`}>
            <div className="flex gap-2 items-center justify-center h-20 w-40">
              {[...Array(8)].map((_, i) => (
                <motion.div 
                  key={i} 
                  animate={{ 
                    height: status === 'speaking' ? [20, 80, 20] : status === 'listening' ? [10, 30, 10] : 10 
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: status === 'speaking' ? 0.4 : 1.2, 
                    delay: i * 0.1 
                  }}
                  className={`w-2.5 rounded-full transition-colors duration-500 ${
                    status === 'speaking' ? 'bg-blue-400' : 
                    status === 'listening' ? 'bg-emerald-400' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h2 className="text-4xl font-black tracking-tight text-white uppercase italic">
              {status === 'connecting' ? 'Calibrating Neural Sync...' :
               status === 'listening' ? 'Omni-Ear Active' :
               status === 'speaking' ? 'Omni-Voice Synthesizing' :
               'Neural Link Severed'}
            </h2>
            <div className="flex justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Real-time PCM stream active</span>
            </div>
          </motion.div>

          <div className="glass p-8 rounded-[2rem] min-h-[140px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p 
                key={transcript || status}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-slate-300 text-xl font-medium leading-relaxed italic"
              >
                {transcript || (status === 'listening' ? '"I am listening. What is on your mind?"' : 'Synchronizing neural pathways...')}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-4">
            <span className="px-5 py-2 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-slate-400 tracking-widest">GEMINI 2.5 NATIVE</span>
            <span className="px-5 py-2 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-slate-400 tracking-widest">ZERO-BUFFER-IO</span>
          </div>
          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.4em]">OmniMind Adaptive Intelligence Mode</p>
        </div>
      </div>
    </motion.div>
  );
};