import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { X, Send, Bot, User } from "lucide-react";
import { Streamdown } from "streamdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChat({ context, onClose }: { context?: string; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "مرحبًا! أنا سايبر، مساعدك الذكي في الأمن السيبراني. كيف يمكنني مساعدتك اليوم؟" }
  ]);
  const [input, setInput] = useState("");

  const askMutation = trpc.aiAssistant.ask.useMutation({
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: "assistant" as const, content: data.answer }]);
    },
    onError: () => {
      setMessages(prev => [...prev, { role: "assistant", content: "عذرًا، حدث خطأ. حاول مرة أخرى." }]);
    }
  });

  const handleSend = () => {
    if (!input.trim() || askMutation.isPending) return;
    const question = input.trim();
    setMessages(prev => [...prev, { role: "user", content: question }]);
    setInput("");
    askMutation.mutate({ question, context });
  };

  return (
    <div className="fixed bottom-4 left-4 w-96 max-w-[calc(100vw-2rem)] h-[500px] max-h-[70vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-primary/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <span className="font-bold text-sm">سايبر</span>
            <span className="text-xs text-muted-foreground block">مساعد الذكاء الاصطناعي</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === "user" ? "bg-primary/20" : "bg-accent/20"
            }`}>
              {msg.role === "user" ? <User className="w-4 h-4 text-primary" /> : <Bot className="w-4 h-4 text-accent" />}
            </div>
            <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}>
              {msg.role === "assistant" ? <Streamdown>{msg.content}</Streamdown> : msg.content}
            </div>
          </div>
        ))}
        {askMutation.isPending && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-accent" />
            </div>
            <div className="bg-secondary rounded-xl px-4 py-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="اسأل سايبر عن أي شيء..."
            className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
          />
          <Button
            size="sm"
            className="bg-primary text-primary-foreground"
            onClick={handleSend}
            disabled={!input.trim() || askMutation.isPending}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
