import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sprout, CloudRain, Bug, FlaskConical, Trash2, ChevronRight, Mic, MicOff, ImagePlus, X, MapPin, Wind, Droplets, Thermometer, Plus, MessageSquare, Menu, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  role: "user" | "model";
  text: string;
  timestamp: string;
  image?: string;
}

interface Chat {
  id: string;
  title: string;
  crop: string;
  messages: Message[];
  createdAt: string;
}

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
}

const CROP_OPTIONS = [
  "Sugarcane", "Rice", "Wheat", "Corn", "Tomato", "Cotton", "Soybean", "Potato", "Other"
];

const QUICK_ACTIONS = [
  { id: "crops", label: "Crop Suggestions", icon: Sprout, prompt: "What crops are best for loamy soil in a tropical climate?" },
  { id: "weather", label: "Weather Advice", icon: CloudRain, prompt: "How should I prepare my crops for the current weather?" },
  { id: "pests", label: "Pest Control", icon: Bug, prompt: "How do I control aphids on my tomato plants naturally?" },
  { id: "fertilizer", label: "Fertilizer Info", icon: FlaskConical, prompt: "What is the best NPK ratio for rice cultivation?" },
];

const SMART_SUGGESTIONS = [
  "What should I plant now?",
  "How to treat leaf rust?",
  "Best organic fertilizers?",
  "Irrigation tips for summer",
];

export default function App() {
  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem("agribot_chats");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    return localStorage.getItem("agribot_active_chat_id");
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeChat = chats.find(c => c.id === activeChatId);
  const messages = activeChat?.messages || [];

  useEffect(() => {
    localStorage.setItem("agribot_chats", JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem("agribot_active_chat_id", activeChatId);
    } else {
      localStorage.removeItem("agribot_active_chat_id");
    }
    scrollToBottom();
  }, [activeChatId, chats]);

  useEffect(() => {
    // Fetch weather on mount
    fetchWeather();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 1. WEATHER API INTEGRATION
  const fetchWeather = async () => {
    if (!navigator.geolocation) return;
    
    setIsFetchingWeather(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        // Using a free weather API (Open-Meteo) which doesn't require a key for basic use
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`);
        const data = await response.json();
        
        if (data.current) {
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            condition: getWeatherCondition(data.current.weather_code),
            humidity: data.current.relative_humidity_2m,
            windSpeed: data.current.wind_speed_10m,
            location: "Your Location", // Open-Meteo doesn't provide name, can use reverse geocoding if needed
          });
        }
      } catch (err) {
        console.error("Weather fetch error:", err);
      } finally {
        setIsFetchingWeather(false);
      }
    }, (err) => {
      console.error("Geolocation error:", err);
      setIsFetchingWeather(false);
    });
  };

  const getWeatherCondition = (code: number) => {
    if (code === 0) return "Clear sky";
    if (code <= 3) return "Partly cloudy";
    if (code <= 48) return "Foggy";
    if (code <= 67) return "Rainy";
    if (code <= 77) return "Snowy";
    if (code <= 99) return "Thunderstorm";
    return "Unknown";
  };

  // 2. FILE UPLOAD FEATURE
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support voice input.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      setInput(event.results[0][0].transcript);
    };
    recognition.start();
  };

  const createNewChat = (crop: string) => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: `New ${crop} Chat`,
      crop: crop,
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setShowCropModal(false);
    setIsSidebarOpen(false);
  };

  const deleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Delete this conversation?")) {
      setChats(prev => prev.filter(c => c.id !== id));
      if (activeChatId === id) setActiveChatId(null);
    }
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim() && !selectedImage || isLoading || !activeChatId) return;

    const userMessage: Message = {
      role: "user",
      text: text.trim() || (selectedImage ? "Analyzed an image" : ""),
      timestamp: new Date().toISOString(),
      image: selectedImage || undefined,
    };

    // Update messages for the active chat
    setChats(prev => prev.map(c => 
      c.id === activeChatId ? { ...c, messages: [...c.messages, userMessage] } : c
    ));

    setInput("");
    const currentImage = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.map((m) => ({
            role: m.role,
            parts: [{ text: m.text }],
          })),
          image: currentImage,
          weather: weather,
          crop: activeChat?.crop
        }),
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const textError = await response.text();
        throw new Error(response.status === 413 ? "Image is too large. Please try a smaller file." : textError || "Server error");
      }

      if (!response.ok) throw new Error(data.error || "Failed to get response");

      const botMessage: Message = {
        role: "model",
        text: data.response,
        timestamp: new Date().toISOString(),
      };

      setChats(prev => prev.map(c => 
        c.id === activeChatId ? { ...c, messages: [...c.messages, botMessage] } : c
      ));
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm("Clear all chat history?")) {
      setChats([]);
      setActiveChatId(null);
      localStorage.removeItem("agribot_chats");
      localStorage.removeItem("agribot_active_chat_id");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex font-sans text-stone-900 overflow-hidden">
      {/* Sidebar - Multi-Chat System */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-emerald-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between border-b border-emerald-800">
            <div className="flex items-center gap-2">
              <Sprout className="w-6 h-6 text-emerald-400" />
              <span className="font-bold text-lg">AgriBot</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 hover:bg-emerald-800 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4">
            <button 
              onClick={() => setShowCropModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-medium transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              New Conversation
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 space-y-2 custom-scrollbar">
            {chats.length === 0 ? (
              <div className="text-center py-10 text-emerald-300/50 text-sm italic px-4">
                No conversations yet. Start a new one to get advice!
              </div>
            ) : (
              chats.map(chat => (
                <div
                  key={chat.id}
                  onClick={() => {
                    setActiveChatId(chat.id);
                    setIsSidebarOpen(false);
                  }}
                  className={cn(
                    "group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
                    activeChatId === chat.id ? "bg-emerald-800 text-white" : "text-emerald-100 hover:bg-emerald-800/50"
                  )}
                >
                  <MessageSquare className={cn("w-5 h-5", activeChatId === chat.id ? "text-emerald-400" : "text-emerald-500")} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{chat.title}</p>
                    <p className="text-[10px] text-emerald-400/70">{chat.crop}</p>
                  </div>
                  <button 
                    onClick={(e) => deleteChat(chat.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded text-emerald-400 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-emerald-800">
            <button onClick={clearChat} className="w-full flex items-center justify-center gap-2 py-2 text-emerald-300 hover:text-white text-xs transition-colors">
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-emerald-700 text-white py-4 px-6 shadow-md flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:block bg-white/20 p-2 rounded-lg">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                {activeChat ? activeChat.crop : "AgriBot"}
              </h1>
              <p className="text-xs text-emerald-100 opacity-80">
                {activeChat ? "Active Conversation" : "Select a chat to begin"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Weather Widget */}
            {weather && (
              <div className="hidden sm:flex items-center gap-3 bg-white/10 px-3 py-1 rounded-full text-xs">
                <div className="flex items-center gap-1">
                  <Thermometer className="w-3 h-3" />
                  <span>{weather.temp}°C</span>
                </div>
                <div className="flex items-center gap-1">
                  <Droplets className="w-3 h-3" />
                  <span>{weather.humidity}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wind className="w-3 h-3" />
                  <span>{weather.windSpeed}m/s</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Chat Area */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6 overflow-hidden relative">
          {!activeChatId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-700">
              <div className="bg-emerald-100 p-6 rounded-full">
                <Bot className="w-16 h-16 text-emerald-600" />
              </div>
              <div className="max-w-md">
                <h2 className="text-2xl font-bold text-stone-800 mb-2">Welcome to AgriBot!</h2>
                <p className="text-stone-600">
                  Start a new conversation to get personalized advice for your crops.
                </p>
                <button 
                  onClick={() => setShowCropModal(true)}
                  className="mt-6 px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md"
                >
                  Start New Chat
                </button>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-700">
              <div className="bg-emerald-100 p-6 rounded-full">
                <Sprout className="w-16 h-16 text-emerald-600" />
              </div>
              <div className="max-w-md">
                <h2 className="text-2xl font-bold text-stone-800 mb-2">Growing {activeChat.crop}?</h2>
                <p className="text-stone-600">
                  Ask me anything about {activeChat.crop.toLowerCase()} cultivation, pests, or fertilizers.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleSend(action.prompt.replace("crops", activeChat.crop))}
                    className="flex items-center gap-3 p-4 bg-white border border-stone-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all text-left group"
                  >
                    <div className="bg-emerald-50 p-2 rounded-lg group-hover:bg-emerald-100 transition-colors">
                      <action.icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <span className="block font-medium text-stone-800">{action.label}</span>
                      <span className="text-xs text-stone-500 line-clamp-1">{action.prompt.replace("crops", activeChat.crop)}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-emerald-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className={cn("flex w-full gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div className={cn("flex max-w-[85%] md:max-w-[75%] gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm", msg.role === "user" ? "bg-emerald-600 text-white" : "bg-white text-emerald-600 border border-emerald-100")}>
                      {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                    </div>
                    <div className={cn("p-4 rounded-2xl shadow-sm relative", msg.role === "user" ? "bg-emerald-600 text-white rounded-tr-none" : "bg-white border border-stone-200 text-stone-800 rounded-tl-none")}>
                      {msg.image && (
                        <img src={msg.image} alt="Uploaded crop" className="w-full max-w-xs rounded-lg mb-3 shadow-sm" referrerPolicy="no-referrer" />
                      )}
                      <div className="prose prose-sm max-w-none prose-stone dark:prose-invert">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                      <span className={cn("text-[10px] mt-2 block opacity-60", msg.role === "user" ? "text-right" : "text-left")}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <div className="flex justify-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-emerald-100 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                  <Bot className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="bg-white border border-stone-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce"></span>
                  </div>
                  <span className="text-xs text-stone-500 font-medium italic">AgriBot is analyzing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t border-stone-200 p-4 md:p-6 sticky bottom-0">
        <div className="max-w-4xl w-full mx-auto space-y-4">
          
          {/* Smart Suggestions Bar */}
          {messages.length > 0 && !isLoading && (
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {SMART_SUGGESTIONS.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(suggestion)}
                  className="whitespace-nowrap px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs hover:bg-emerald-100 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Image Preview */}
          {selectedImage && (
            <div className="relative inline-block">
              <img src={selectedImage} alt="Preview" className="w-20 h-20 object-cover rounded-lg border-2 border-emerald-500" referrerPolicy="no-referrer" />
              <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative flex items-center gap-3">
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 bg-stone-100 text-stone-600 rounded-2xl hover:bg-stone-200 transition-all border border-stone-200">
              <ImagePlus className="w-6 h-6" />
            </button>

            <button type="button" onClick={startVoiceInput} className={cn("p-3 rounded-2xl transition-all shadow-sm border", isListening ? "bg-red-500 text-white border-red-600 animate-pulse" : "bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200")}>
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : activeChatId ? "Ask about crops, pests, or weather..." : "Select a chat to start..."}
                className="w-full bg-stone-100 border-none rounded-2xl py-4 px-6 pr-14 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none text-stone-800 placeholder:text-stone-400 shadow-inner"
                disabled={isLoading || !activeChatId}
              />
              <button type="submit" disabled={(!input.trim() && !selectedImage) || isLoading || !activeChatId} className={cn("absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all", (input.trim() || selectedImage) && !isLoading && activeChatId ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md" : "bg-stone-200 text-stone-400 cursor-not-allowed")}>
                <Send className="w-6 h-6" />
              </button>
            </div>
          </form>
          
          {/* 4. SAFETY DISCLAIMER */}
          <p className="text-[10px] text-center text-stone-400">
            AgriBot provides AI-powered suggestions. For critical agricultural decisions, always consult with local experts or certified agricultural officers.
          </p>
        </div>
      </footer>
    </div>

      {/* Crop Selection Modal */}
      <AnimatePresence>
        {showCropModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCropModal(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="bg-emerald-600 p-6 text-white">
                <h3 className="text-xl font-bold">Start New Conversation</h3>
                <p className="text-emerald-100 text-sm">Select the crop you want to discuss</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-3 gap-3">
                  {CROP_OPTIONS.map(crop => (
                    <button
                      key={crop}
                      onClick={() => createNewChat(crop)}
                      className="p-3 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-transparent rounded-xl text-sm font-medium transition-all text-center"
                    >
                      {crop}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setShowCropModal(false)}
                  className="w-full mt-6 py-3 text-stone-500 font-medium hover:text-stone-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
