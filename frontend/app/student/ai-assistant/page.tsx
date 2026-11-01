"use client";

import { useEffect, useState, useRef } from "react";
import {
  Bot,
  Send,
  Plus,
  Trash2,
  MessageSquare,
  User as UserIcon,
  Loader2,
} from "lucide-react";
import { aiApi, getErrorMessage } from "@/services/api";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { AIConversation } from "@/types";
import toast from "react-hot-toast";

// Simple markdown-to-HTML renderer
function renderMarkdown(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^### (.*$)/gm, "<h3>$1</h3>")
    .replace(/^## (.*$)/gm, "<h2>$1</h2>")
    .replace(/^# (.*$)/gm, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/^- (.*$)/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>")
    .replace(/<p><h/g, "<h")
    .replace(/<\/h(\d)><\/p>/g, "</h$1>")
    .replace(/<p><pre/g, "<pre")
    .replace(/<\/pre><\/p>/g, "</pre>")
    .replace(/<p><ul/g, "<ul")
    .replace(/<\/ul><\/p>/g, "</ul>");
}

export default function AIAssistantPage() {
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<AIConversation | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await aiApi.getConversations();
      setConversations(res.data.data.conversations || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingConvos(false);
    }
  };

  const loadConversation = async (id: string) => {
    try {
      const res = await aiApi.getConversation(id);
      setActiveConversation(res.data.data.conversation);
      setMessages(res.data.data.conversation.messages);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const startNewChat = () => {
    setActiveConversation(null);
    setMessages([]);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setSending(true);

    // Show typing indicator
    setMessages((prev) => [...prev, { role: "assistant", content: "__thinking__" }]);

    try {
      const res = await aiApi.chat({
        conversationId: activeConversation?._id,
        message: userMessage,
      });
      const reply = res.data.data.reply;
      const conversation = res.data.data.conversation;

      // Remove thinking indicator and add real reply
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: reply },
      ]);

      if (!activeConversation) {
        setActiveConversation(conversation);
      }
      fetchConversations();
    } catch (err) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "Sorry, I couldn't process your request. Please try again." },
      ]);
      toast.error(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await aiApi.deleteConversation(deleteTarget);
      toast.success("Conversation deleted");
      if (activeConversation?._id === deleteTarget) {
        startNewChat();
      }
      setDeleteTarget(null);
      fetchConversations();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const quickPrompts = [
    "Explain how JavaScript promises work",
    "What are the differences between SQL and NoSQL?",
    "Help me understand Big O notation",
    "Generate 5 practice questions about React hooks",
  ];

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Conversation list */}
      <div className="hidden w-64 shrink-0 md:flex md:flex-col">
        <div className="card flex flex-col overflow-hidden flex-1">
          <div className="border-b border-slate-100 p-3 dark:border-slate-800">
            <button onClick={startNewChat} className="btn-primary w-full text-sm">
              <Plus size={16} /> New Chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {loadingConvos ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-slate-400" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-slate-400">No conversations yet</p>
            ) : (
              <div className="space-y-1">
                {conversations.map((convo) => (
                  <div
                    key={convo._id}
                    className={`group flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm cursor-pointer transition-colors ${
                      activeConversation?._id === convo._id
                        ? "bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-400"
                        : "hover:bg-slate-50 text-slate-600 dark:hover:bg-slate-800 dark:text-slate-400"
                    }`}
                    onClick={() => loadConversation(convo._id)}
                  >
                    <MessageSquare size={14} className="shrink-0" />
                    <span className="flex-1 truncate text-xs">{convo.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(convo._id);
                      }}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 size={14} className="text-red-400 hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col min-w-0">
        <div className="card flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-slate-100 p-4 dark:border-slate-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950/40">
              <Bot className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">AI Learning Assistant</h2>
              <p className="text-xs text-slate-500">Ask anything about your courses</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-950/40">
                  <Bot className="h-8 w-8 text-brand-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">How can I help you learn?</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                  Ask me to explain concepts, generate practice questions, or summarize topics.
                </p>
                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setInput(prompt)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-left text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:border-brand-200 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    msg.role === "user"
                      ? "bg-brand-600"
                      : "bg-slate-200 dark:bg-slate-800"
                  }`}>
                    {msg.role === "user" ? (
                      <UserIcon className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-brand-600" />
                    )}
                  </div>
                  <div
                    className={`prose-content max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === "user"
                        ? "bg-brand-600 text-white"
                        : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {msg.content === "__thinking__" ? (
                      <div className="flex items-center gap-1.5 py-1">
                        <Loader2 className="animate-spin" size={14} />
                        <span className="text-xs">Thinking...</span>
                      </div>
                    ) : msg.role === "assistant" ? (
                      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-100 p-4 dark:border-slate-800">
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                disabled={sending}
                className="input-field flex-1"
              />
              <button type="submit" disabled={sending || !input.trim()} className="btn-primary">
                {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              </button>
            </form>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete conversation?"
        message="This will permanently delete the conversation and all its messages."
        danger
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
