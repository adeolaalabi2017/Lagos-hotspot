"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "@/lib/router";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Search, MoreVertical, ArrowLeft, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ThreadListing {
  id: string;
  title: string;
  image: string | null;
  category: string;
  city: string | null;
  authorId: string | null;
}

interface LastMessage {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
}

interface Thread {
  id: string;
  listingId: string;
  listing: ThreadListing;
  lastMessageAt: string;
  createdAt: string;
  lastMessage: LastMessage | null;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
}

const POLL_INTERVAL_MS = 15000;

function initialsFor(value: string): string {
  return value
    .split(/\s+/)
    .map((p) => p[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardMessages() {
  const { navigate } = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [threads, setThreads] = useState<Thread[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [threadsError, setThreadsError] = useState<string | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showChatMobile, setShowChatMobile] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Read ?threadId= from the URL hash so StartConversationLink can land
  // here with the new thread already selected.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    const qIdx = hash.indexOf("?");
    if (qIdx === -1) return;
    const params = new URLSearchParams(hash.slice(qIdx + 1));
    const tid = params.get("threadId");
    if (!tid) return;
    const apply = () => {
      setSelectedThreadId(tid);
      setShowChatMobile(true);
    };
    void Promise.resolve().then(apply);
  }, []);

  const loadThreads = useCallback(
    async (showSpinner = false) => {
      if (!isAuthenticated) return;
      if (showSpinner) setLoadingThreads(true);
      try {
        const res = await fetch("/api/messaging/threads", {
          credentials: "same-origin",
        });
        if (!res.ok) {
          setThreadsError("Could not load inbox");
          return;
        }
        const data = (await res.json()) as { threads?: Thread[] };
        setThreads(Array.isArray(data.threads) ? data.threads : []);
        setThreadsError(null);
      } catch {
        setThreadsError("Could not load inbox");
      } finally {
        if (showSpinner) setLoadingThreads(false);
      }
    },
    [isAuthenticated]
  );

  useEffect(() => {
    let cancelled = false;
    async function run() {
      await loadThreads(true);
    }
    void run();
    const handle = setInterval(() => void loadThreads(false), POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(handle);
    };
  }, [loadThreads]);

  const loadMessages = useCallback(async (threadId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(
        `/api/messaging/threads/${encodeURIComponent(threadId)}/messages`,
        { credentials: "same-origin" }
      );
      if (!res.ok) {
        toast.error("Could not load messages");
        return;
      }
      const data = (await res.json()) as { messages?: Message[] };
      setMessages(Array.isArray(data.messages) ? data.messages : []);
    } catch {
      toast.error("Could not load messages");
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    const tid = selectedThreadId;
    if (!tid) return;
    let cancelled = false;
    async function run() {
      await loadMessages(tid!);
      if (cancelled) return;
      await fetch(
        `/api/messaging/threads/${encodeURIComponent(tid!)}/read`,
        { method: "POST", credentials: "same-origin" }
      ).catch(() => {});
      setThreads((prev) =>
        prev.map((t) =>
          t.id === tid! ? { ...t, unreadCount: 0 } : t
        )
      );
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [selectedThreadId, loadMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!selectedThreadId) return;
    const text = messageInput.trim();
    if (!text) return;
    setSending(true);

    // Optimistic
    const optimisticId = `pending-${Date.now()}`;
    const optimistic: Message = {
      id: optimisticId,
      senderId: user?.id ?? "",
      body: text,
      createdAt: new Date().toISOString(),
      readAt: null,
    };
    setMessages((prev) => [...prev, optimistic]);
    setMessageInput("");
    try {
      const res = await fetch(
        `/api/messaging/threads/${encodeURIComponent(selectedThreadId)}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ body: text }),
        }
      );
      if (res.status === 403) {
        throw new Error("Your account is suspended and cannot send messages.");
      }
      if (!res.ok) {
        throw new Error("Could not send message");
      }
      const data = (await res.json()) as { message: Message };
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticId ? data.message : m))
      );
      // Bump thread's lastMessageAt
      setThreads((prev) =>
        prev.map((t) =>
          t.id === selectedThreadId
            ? {
                ...t,
                lastMessageAt: data.message.createdAt,
                lastMessage: {
                  id: data.message.id,
                  senderId: data.message.senderId,
                  body: data.message.body,
                  createdAt: data.message.createdAt,
                  readAt: null,
                },
              }
            : t
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not send";
      toast.error(message);
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setMessageInput(text);
    } finally {
      setSending(false);
    }
  }

  const filteredThreads = threads.filter((t) =>
    t.listing.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const selectedThread = threads.find((t) => t.id === selectedThreadId) ?? null;

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <h3 className="font-semibold text-foreground mb-1">
            Sign in to see your messages
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Chat with the hosts of your saved spots.
          </p>
          <Button onClick={() => navigate("login")}>Sign In</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`${showChatMobile ? "hidden sm:block" : ""}`}>
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Chat with the hosts of Lagos hotspots.
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="flex h-[600px]">
          {/* Threads list */}
          <div
            className={`w-full sm:w-80 border-r flex flex-col shrink-0 ${
              showChatMobile ? "hidden sm:flex" : "flex"
            }`}
          >
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingThreads ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                  Loading inbox…
                </div>
              ) : threadsError ? (
                <div className="p-8 text-center text-sm text-destructive">
                  {threadsError}
                </div>
              ) : filteredThreads.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  {threads.length === 0
                    ? "No conversations yet. Start one from any hotspot page."
                    : "No threads match your search."}
                </div>
              ) : (
                filteredThreads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => {
                      setSelectedThreadId(thread.id);
                      setShowChatMobile(true);
                    }}
                    className={`flex items-center gap-3 w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      selectedThreadId === thread.id
                        ? "bg-primary/5 border-l-2 border-l-primary"
                        : ""
                    }`}
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      {thread.listing.image ? (
                        <AvatarImage
                          src={thread.listing.image}
                          alt={thread.listing.title}
                        />
                      ) : null}
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {initialsFor(thread.listing.title)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground truncate">
                          {thread.listing.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                          {formatTime(thread.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {thread.lastMessage?.body ?? "(no messages yet)"}
                      </p>
                    </div>
                    {thread.unreadCount > 0 && (
                      <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center shrink-0">
                        {thread.unreadCount}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat area */}
          <div
            className={`flex-1 flex flex-col ${
              showChatMobile ? "flex" : "hidden sm:flex"
            }`}
          >
            {selectedThread ? (
              <>
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="sm:hidden h-8 w-8"
                      onClick={() => setShowChatMobile(false)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Avatar className="h-9 w-9">
                      {selectedThread.listing.image ? (
                        <AvatarImage
                          src={selectedThread.listing.image}
                          alt={selectedThread.listing.title}
                        />
                      ) : null}
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {initialsFor(selectedThread.listing.title)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {selectedThread.listing.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {selectedThread.listing.city ?? "Lagos"} ·{" "}
                        {selectedThread.listing.category}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          navigate("hotspot", {
                            hotspotId: selectedThread.listingId,
                          })
                        }
                      >
                        View Spot
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                  {loadingMessages ? (
                    <div className="text-center text-sm text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                      Loading messages…
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground">
                      Say hi!
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOwn = msg.senderId === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${
                            isOwn ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                              isOwn
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-white text-foreground border rounded-bl-md shadow-sm"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">
                              {msg.body}
                            </p>
                            <p
                              className={`text-[10px] mt-1 ${
                                isOwn
                                  ? "text-primary-foreground/70"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-4 border-t">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          void handleSend();
                        }
                      }}
                      className="flex-1"
                      maxLength={2000}
                    />
                    <Button
                      size="icon"
                      onClick={() => void handleSend()}
                      disabled={sending || !messageInput.trim()}
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-12 text-center text-sm text-muted-foreground">
                Select a conversation to start chatting.
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
