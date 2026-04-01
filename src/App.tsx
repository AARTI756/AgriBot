import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sprout, CloudRain, Bug, FlaskConical, Trash2, ChevronRight } from "lucide-react";
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
  timestamp: Date;
}

const QUICK_ACTIONS = [
  { id: "crops", label: "Crop Suggestions", icon: Sprout, prompt: "What crops are best for loamy soil in a tropical climate?" },
  { id: "weather", label: "Weather Advice", icon: CloudRain, prompt: "How should I prepare my crops for heavy rainfall?" },
  { id: "pests", label: "Pest Control", icon: Bug, prompt: "How do I control aphids on my tomato plants naturally?" },
  { id: "fertilizer", label: "Fertilizer Info", icon: FlaskConical, prompt: "What is the best NPK ratio for rice cultivation?" },
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const data = await response.json();
      const botMessage: Message = {
        role: "model",
        text: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      console.error("Chat Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      setMessages([]);
      setError(null);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900">
      {/* Header */}
      <header className="bg-emerald-700 text-white py-4 px-6 shadow-md flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">AgriBot</h1>
            <p className="text-xs text-emerald-100 opacity-80">Your AI Agriculture Assistant</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-2 hover:bg-white/10 rounded-full transition-colors text-emerald-100 hover:text-white"
          title="Clear Chat"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6 overflow-hidden">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-700">
            <div className="bg-emerald-100 p-6 rounded-full">
              <Bot className="w-16 h-16 text-emerald-600" />
            </div>
            <div className="max-w-md">
              <h2 className="text-2xl font-bold text-stone-800 mb-2">Welcome to AgriBot!</h2>
              <p className="text-stone-600">
                I'm here to help you with crop advice, pest control, and more. 
                Ask me anything about your farm or choose a topic below.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleSend(action.prompt)}
                  className="flex items-center gap-3 p-4 bg-white border border-stone-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all text-left group"
                >
                  <div className="bg-emerald-50 p-2 rounded-lg group-hover:bg-emerald-100 transition-colors">
                    <action.icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <span className="block font-medium text-stone-800">{action.label}</span>
                    <span className="text-xs text-stone-500 line-clamp-1">{action.prompt}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-emerald-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex w-full gap-3",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "flex max-w-[85%] md:max-w-[75%] gap-3",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}>
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm",
                      msg.role === "user" ? "bg-emerald-600 text-white" : "bg-white text-emerald-600 border border-emerald-100"
                    )}>
                      {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                    </div>
                    <div className={cn(
                      "p-4 rounded-2xl shadow-sm",
                      msg.role === "user" 
                        ? "bg-emerald-600 text-white rounded-tr-none" 
                        : "bg-white border border-stone-200 text-stone-800 rounded-tl-none"
                    )}>
                      <div className="prose prose-sm max-w-none prose-stone dark:prose-invert">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="mb-0">{children}</li>,
                            strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                      <span className={cn(
                        "text-[10px] mt-2 block opacity-60",
                        msg.role === "user" ? "text-right" : "text-left"
                      )}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-white border border-emerald-100 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                  <Bot className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="bg-white border border-stone-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span className="text-sm text-stone-500 italic">AgriBot is thinking...</span>
                </div>
              </motion.div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm flex items-center gap-2">
                <span className="font-bold">Error:</span> {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t border-stone-200 p-4 md:p-6 sticky bottom-0">
        <div className="max-w-4xl w-full mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="relative flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about crops, pests, or weather..."
              className="flex-1 bg-stone-100 border-none rounded-2xl py-4 px-6 pr-14 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none text-stone-800 placeholder:text-stone-400 shadow-inner"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={cn(
                "absolute right-2 p-2 rounded-xl transition-all",
                input.trim() && !isLoading 
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md" 
                  : "bg-stone-200 text-stone-400 cursor-not-allowed"
              )}
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
          <p className="text-[10px] text-center text-stone-400 mt-3">
            AgriBot can make mistakes. Consider checking important agricultural information with local experts.
          </p>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </div>
  );
}
