"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Mic, Send, Volume2, VolumeX, X, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I am MediAssist AI. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize Speech Recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(prev => prev + (prev ? " " : "") + transcript);
          setIsListening(false);
        };
        
        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };
        
        recognition.lang = language === "hi" ? "hi-IN" : "en-US";
        recognitionRef.current = recognition;
      }
    }
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === "hi" ? "hi-IN" : "en-US";
    }
  }, [language]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const playAudio = (base64Data: string) => {
    // Try WAV first (MMS model output), fallback to flac
    const mimeTypes = ["audio/wav", "audio/flac", "audio/mpeg"];
    const tryPlay = (mimeIndex: number) => {
      if (mimeIndex >= mimeTypes.length) {
        console.error("All audio formats failed");
        return;
      }
      const audio = new Audio(`data:${mimeTypes[mimeIndex]};base64,${base64Data}`);
      audio.playbackRate = 1.3; // Speed up the AI's speaking voice
      audio.onerror = () => tryPlay(mimeIndex + 1);
      audio.play().catch(() => tryPlay(mimeIndex + 1));
    };
    tryPlay(0);
  };

  const speakWithBrowserTTS = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    if (language === "hi") {
      const hiVoice = voices.find(v => v.lang.startsWith("hi"));
      if (hiVoice) utterance.voice = hiVoice;
      utterance.lang = "hi-IN";
    } else {
      const preferredVoice =
        voices.find(v => v.name === "Google UK English Female") ||
        voices.find(v => v.name.toLowerCase().includes("female")) ||
        voices.find(v => v.lang.startsWith("en") && v.name.toLowerCase().includes("samantha")) ||
        voices.find(v => v.lang.startsWith("en") && !v.name.toLowerCase().includes("male")) ||
        voices.find(v => v.lang.startsWith("en"));
      if (preferredVoice) utterance.voice = preferredVoice;
    }
    
    utterance.rate = 0.92;
    utterance.pitch = 1.05;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/patient/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage, useTts: isTtsEnabled, language })
      });
      
      const data = await res.json();
      
      if (data.text) {
        setMessages(prev => [...prev, { role: "assistant", content: data.text }]);
        
        if (isTtsEnabled && data.audio) {
          playAudio(data.audio);
        } else if (isTtsEnabled) {
          // Fallback to browser TTS with a polite female voice
          speakWithBrowserTTS(data.text);
        }
      }
    } catch (error) {
      console.error("Error calling assistant:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I am having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg p-0 bg-primary hover:bg-primary/90 text-white z-50 transition-transform hover:scale-105"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-300 transform scale-100 opacity-100">
          
          {/* Header */}
          <div className="bg-primary p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span className="font-semibold text-sm">MediAssist AI</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setLanguage(language === "en" ? "hi" : "en")}
                className="px-2 py-1 hover:bg-white/20 rounded-md transition-colors text-xs font-bold tracking-wider"
                title="Toggle Language"
              >
                {language === "en" ? "EN" : "HI"}
              </button>
              <button 
                onClick={() => setIsTtsEnabled(!isTtsEnabled)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                title={isTtsEnabled ? "Disable Voice" : "Enable Voice"}
              >
                {isTtsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto max-h-[400px] min-h-[300px] flex flex-col gap-3 bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "max-w-[85%] rounded-2xl p-3 text-sm shadow-sm whitespace-pre-wrap",
                  msg.role === "assistant" 
                    ? "bg-white text-slate-800 border border-slate-100 self-start rounded-tl-sm" 
                    : "bg-primary text-white self-end rounded-tr-sm"
                )}
              >
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="bg-white text-slate-800 border border-slate-100 self-start rounded-2xl rounded-tl-sm p-3 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListening}
                className={cn(
                  "p-2 rounded-full transition-colors flex-shrink-0",
                  isListening ? "bg-red-100 text-red-500 animate-pulse" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                )}
              >
                <Mic className="h-4 w-4" />
              </button>
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about your medication..."
                className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800"
              />
              
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="h-9 w-9 rounded-full p-0 flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
