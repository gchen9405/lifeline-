import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useEntriesStore } from "@/store/entries";

interface Message {
  text: string;
  sender: "user" | "bot";
}

export function ChatInterface({ className }: { className?: string }) {
  const entries = useEntriesStore((s) => s.entries);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Hi, I’m Leo, your AI health assistant. How can I help you today?",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const q = currentMessage.trim();
    if (!q || isLoading) return;

    setMessages((prev) => [...prev, { sender: "user", text: q }]);
    const newMessages: Message[] = [...messages, { sender: "user", text: q }];
    setCurrentMessage("");
    setIsLoading(true);

    try {
      const historyForApi = newMessages.map((msg) => ({
        role: msg.sender === "user" ? ("user" as const) : ("model" as const),
        parts: [{ text: msg.text }],
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: historyForApi,
          context: entries,
        }),
      });

      if (!response.ok)
        throw new Error(`API request failed with status ${response.status}`);

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: data.reply ?? "Sorry, I couldn't respond." },
      ]);
    } catch (e) {
      console.error("Failed to get bot response:", e);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, I'm having trouble connecting. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col h-full w-full", className)}>
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "flex items-start gap-2",
              m.sender === "user" && "justify-end"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-lg p-3 text-sm",
                m.sender === "bot"
                  ? "bg-muted text-foreground"
                  : "btn-primary-send text-primary-foreground"
              )}
            >
              {m.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="max-w-[80%] rounded-lg bg-muted p-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full" />
                <div className="h-2 w-2 animate-pulse rounded-full [animation-delay:0.2s]" />
                <div className="h-2 w-2 animate-pulse rounded-full [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t p-4 bg-background">
        <div className="flex gap-2 items-center">
          <Input
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 rounded-full bg-slate-100 border-transparent focus:bg-white focus:border-slate-200 transition-all shadow-none"
          />
          <Button
            onClick={handleSend}
            size="icon"
            disabled={isLoading}
            className="shrink-0 rounded-full h-10 w-10 btn-primary-send shadow-sm"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 hidden md:block">
      <div className="relative">
        {isOpen && (
          <div className="absolute bottom-20 right-0 w-80 h-96 rounded-lg border bg-card shadow-lg flex flex-col overflow-hidden">
            <h3 className="shrink-0 border-b bg-slate-900 p-3 font-semibold text-white">
              AI Assistant
            </h3>
            <ChatInterface className="flex-1" />
          </div>
        )}

        <Button
          onClick={() => setIsOpen((prev) => !prev)}
          size="icon"
          className="h-14 w-14 rounded-full bg-slate-900 shadow-lg transition-all hover:scale-110 hover:bg-slate-800 active:scale-100"
          aria-label={isOpen ? "Close chat" : "Open chat"}
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </Button>
      </div>
    </div>
  );
}