"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, X, Send, Bot, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STARTER_PROMPTS = [
  "How am I doing this week?",
  "Help me plan my day",
  "Why can't I stay focused?",
  "Set a goal for me",
];

export function AiCoachPanel() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || streaming) return;

    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);

    // Add empty assistant message to stream into
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok || !res.body) throw new Error("Failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: accumulated };
          return updated;
        });
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: "Sorry, I couldn't respond right now. Please try again." };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          "fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50 flex h-13 w-13 items-center justify-center rounded-2xl shadow-2xl transition-all duration-300",
          open
            ? "bg-muted text-muted-foreground scale-90"
            : "bg-gradient-to-br from-purple-500 to-blue-500 text-white scale-100 hover:scale-105 shadow-purple-500/30"
        )}
        style={{ width: 52, height: 52 }}
        title="AI Focus Coach"
      >
        {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-4 md:bottom-20 md:right-6 z-50 w-[340px] max-w-[calc(100vw-2rem)] flex flex-col rounded-3xl border border-border bg-card/98 backdrop-blur-2xl shadow-2xl shadow-black/40 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 border-b border-border bg-gradient-to-r from-purple-500/10 to-blue-500/10 cursor-pointer select-none"
            onClick={() => setMinimized(v => !v)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">AI Focus Coach</p>
              <p className="text-[10px] text-muted-foreground">Your personal productivity coach</p>
            </div>
            <button
              onClick={e => { e.stopPropagation(); setMinimized(v => !v); }}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title={minimized ? "Expand" : "Minimize"}
            >
              <Minus className="h-3 w-3" />
            </button>
          </div>

          {/* Messages + Input — hidden when minimized */}
          {!minimized && <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-72 min-h-[120px]">
            {messages.length === 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center py-2">Ask me anything about your focus & productivity</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {STARTER_PROMPTS.map(p => (
                    <button
                      key={p}
                      onClick={() => send(p)}
                      className="text-left text-[11px] px-2.5 py-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors leading-tight"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={cn("flex gap-2", m.role === "user" && "justify-end")}>
                  {m.role === "assistant" && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 mt-0.5">
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed",
                    m.role === "user"
                      ? "bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  )}>
                    {m.content}
                    {m.role === "assistant" && streaming && i === messages.length - 1 && m.content === "" && (
                      <span className="inline-flex gap-0.5 ml-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>}

          {!minimized && <div className="p-3 border-t border-border flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Ask your coach..."
              className="h-9 text-xs rounded-xl bg-muted border-0 focus-visible:ring-1 focus-visible:ring-purple-500/50"
              disabled={streaming}
            />
            <Button
              size="icon"
              onClick={() => send()}
              disabled={!input.trim() || streaming}
              className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 text-white border-0 hover:opacity-90"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>}
        </div>
      )}
    </>
  );
}
