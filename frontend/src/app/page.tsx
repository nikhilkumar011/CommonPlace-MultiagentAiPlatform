"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, KeyboardEvent } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/code-block";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  ApiError,
  apiRequest,
  type ChatMessage,
  type Conversation,
  type MessageAttachment,
  type User,
} from "@/lib/api";

type AuthMode = "login" | "register";
type AgentRoute = "chat" | "coding" | "image" | "pdf" | "search";

const routeNames: Record<AgentRoute, string> = {
  chat: "Chat",
  coding: "Coding",
  image: "Image",
  pdf: "PDF",
  search: "Search",
};

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function conversationDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  if (date.toDateString() === new Date().toDateString()) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

async function encodeAttachment(file: File): Promise<MessageAttachment> {
  return {
    name: file.name,
    mimeType: file.type,
    data: bytesToBase64(new Uint8Array(await file.arrayBuffer())),
  };
}

function AuthScreen({
  onAuthenticated,
  serviceError,
}: {
  onAuthenticated: (user: User) => Promise<void>;
  serviceError: string;
}) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      const payload = await apiRequest<{ user: User }>(path, {
        method: "POST",
        body: JSON.stringify(mode === "login" ? { email, password } : { name, email, password }),
      });
      await onAuthenticated(payload.user);
    } catch (requestError) {
      setError(errorText(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#080808] px-5 py-7 text-[#f2f2f2] sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute -left-40 top-[18%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.07),transparent_68%)]" />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-20">
        <section className="hidden max-w-xl lg:block">
          <div className="mb-16 flex items-center gap-3">
            <span className="brand-mark flex h-9 w-9 items-center justify-center border border-[#585858] text-[11px] font-semibold text-white">C</span>
            <span className="text-sm font-medium tracking-[0.02em] text-[#f2f2f2]">commonplace</span>
          </div>
          <p className="mb-6 text-[10px] font-medium uppercase tracking-[0.24em] text-[#929292]">A workspace for considered work</p>
          <h1 className="max-w-lg text-6xl font-light leading-[1.02] tracking-[-0.065em] text-[#f2f2f2] xl:text-[72px]">
            Think clearly.
            <br />
            <span className="text-[#777]">Make something.</span>
          </h1>
          <p className="mt-7 max-w-md text-sm leading-7 text-[#929292]">
            A focused space for questions, research, code, and the ideas that need room to take shape.
          </p>
          <div className="mt-16 flex items-center gap-4 border-t border-[#252525] pt-5 text-[10px] uppercase tracking-[0.16em] text-[#888]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#aaa] opacity-30" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c4c4c4]" />
            </span>
            Five focused agents · One continuous workspace
          </div>
        </section>

        <section className="rise-in relative w-full border border-[#292929] bg-[#0e0e0e]/95 px-7 py-8 sm:px-9 sm:py-10">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#777] to-transparent opacity-70" />
        <div className="mb-9 lg:mb-10">
          <div className="mb-9 flex items-center gap-3">
            <span className="brand-mark flex h-8 w-8 items-center justify-center border border-[#555] text-[10px] font-semibold text-white lg:hidden">C</span>
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#909090]">Your workspace</span>
          </div>
          <h2 className="text-[29px] font-light tracking-[-0.05em] text-[#f4f4f4]">
            {mode === "login" ? "Welcome back." : "A good place to begin."}
          </h2>
          <p className="mt-2 text-[13px] leading-6 text-[#858585]">
            {mode === "login"
              ? "Sign in and return to what you were working on."
              : "Create an account to start a new line of thought."}
          </p>
        </div>

        <form className="space-y-4" onSubmit={submit}>
          {mode === "register" && (
            <label className="block space-y-2 text-[11px] font-medium tracking-wide text-[#c9c9c9]">
              Name
              <Input
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="h-11 rounded-none border-[#303030] bg-[#121212] text-sm text-[#f2f2f2] transition-colors placeholder:text-[#666] focus-visible:border-[#888] focus-visible:ring-0"
              />
            </label>
          )}
          <label className="block space-y-2 text-[11px] font-medium tracking-wide text-[#c9c9c9]">
            Email
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="h-11 rounded-none border-[#303030] bg-[#121212] text-sm text-[#f2f2f2] transition-colors placeholder:text-[#666] focus-visible:border-[#888] focus-visible:ring-0"
            />
          </label>
          <label className="block space-y-2 text-[11px] font-medium tracking-wide text-[#c9c9c9]">
            Password
            <Input
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              minLength={mode === "register" ? 8 : undefined}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="h-11 rounded-none border-[#303030] bg-[#121212] text-sm text-[#f2f2f2] transition-colors placeholder:text-[#666] focus-visible:border-[#888] focus-visible:ring-0"
            />
          </label>
          {(error || serviceError) && (
            <p role="alert" className="border-l border-[#d77] bg-[#201414] px-3 py-2 text-xs leading-5 text-[#e6a4a4]">
              {error || serviceError}
            </p>
          )}
          <Button
            type="submit"
            disabled={busy}
            className="group relative mt-3 h-11 w-full overflow-hidden rounded-none bg-[#e8e8e8] text-xs font-semibold tracking-wide text-[#0b0b0b] transition-colors hover:bg-white"
          >
            <span className="relative z-10">{busy ? "Please wait…" : mode === "login" ? "Continue" : "Create account"}</span>
            <span className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/40 transition-transform duration-700 group-hover:translate-x-[500%]" />
          </Button>
        </form>

        <p className="mt-7 border-t border-[#272727] pt-5 text-center text-xs text-[#818181]">
          {mode === "login" ? "New to Commonplace?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setError("");
              setMode(mode === "login" ? "register" : "login");
            }}
            className="text-[#e7e7e7] underline decoration-[#5b5b5b] underline-offset-4 transition-colors hover:text-white"
          >
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
        </section>
      </div>
    </main>
  );
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");
  const [activeRoute, setActiveRoute] = useState<AgentRoute | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadConversations = useCallback(async () => {
    const payload = await apiRequest<{ conversations: Conversation[] }>("/chat/conversations");
    setConversations(payload.conversations);
  }, []);

  async function handleAuthenticated(authenticatedUser: User) {
    setUser(authenticatedUser);
    setError("");
    try {
      await loadConversations();
    } catch (requestError) {
      setError(errorText(requestError));
    }
  }

  useEffect(() => {
    let active = true;
    apiRequest<{ user: User }>("/auth/me")
      .then(async ({ user: currentUser }) => {
        if (!active) return;
        setUser(currentUser);
        const result = await apiRequest<{ conversations: Conversation[] }>("/chat/conversations");
        if (active) setConversations(result.conversations);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        if (!(requestError instanceof ApiError && requestError.status === 401)) {
          setError(errorText(requestError));
        }
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  async function selectConversation(conversation: Conversation) {
    setActiveConversation(conversation);
    setMessages([]);
    setError("");
    setActiveRoute(null);
    setSidebarOpen(false);
    setLoadingMessages(true);
    try {
      const [conversationPayload, messagesPayload] = await Promise.all([
        apiRequest<{ conversation: Conversation }>(`/chat/conversations/${conversation._id}`),
        apiRequest<{ messages: ChatMessage[] }>(
          `/chat/conversations/${conversation._id}/messages`,
        ),
      ]);
      setActiveConversation(conversationPayload.conversation);
      setMessages(messagesPayload.messages);
    } catch (requestError) {
      setError(errorText(requestError));
    } finally {
      setLoadingMessages(false);
    }
  }

  function startConversation() {
    setActiveConversation(null);
    setMessages([]);
    setDraft("");
    setError("");
    setActiveRoute(null);
    setSelectedFile(null);
    setSidebarOpen(false);
    textareaRef.current?.focus();
  }

  async function sendMessage(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const content = draft.trim() || (
      selectedFile?.type === "application/pdf"
        ? "Please analyze the attached PDF."
        : selectedFile
          ? "Please edit the attached image according to my instructions."
          : ""
    );
    if (!content || busy) return;

    setDraft("");
    setError("");
    setBusy(true);
    let conversation = activeConversation;
    const history = messages.map(({ role, content: text }) => ({ role, content: text }));

    try {
      const currentAttachment = selectedFile
        ? await encodeAttachment(selectedFile)
        : undefined;
      const contextAttachment =
        currentAttachment ??
        [...messages]
          .reverse()
          .find((message) => message.role === "user" && message.attachment)
          ?.attachment;

      if (!conversation) {
        const created = await apiRequest<{ conversation: Conversation }>("/chat/conversations", {
          method: "POST",
          body: JSON.stringify({ title: content.slice(0, 72) }),
        });
        conversation = created.conversation;
        setActiveConversation(conversation);
        setConversations((current) => [conversation!, ...current]);
      }

      const userMessage = await apiRequest<{ message: ChatMessage }>(
        `/chat/conversations/${conversation._id}/messages`,
        {
          method: "POST",
          body: JSON.stringify({
            content,
            role: "user",
            ...(currentAttachment ? { attachment: currentAttachment } : {}),
          }),
        },
      );
      setMessages((current) => [...current, userMessage.message]);
      setSelectedFile(null);

      const response = await apiRequest<{
        route: AgentRoute;
        response: string;
        artifact: { kind: "image"; name: string; mimeType: string; data: string } | null;
      }>("/agent/invoke", {
        method: "POST",
        body: JSON.stringify({
          message: content,
          history,
          ...(contextAttachment ? { attachment: contextAttachment } : {}),
        }),
      });
      const assistantMessage = await apiRequest<{ message: ChatMessage }>(
        `/chat/conversations/${conversation._id}/messages`,
        {
          method: "POST",
          body: JSON.stringify({
            content: response.response,
            role: "assistant",
            ...(response.artifact
              ? {
                  attachment: {
                    name: response.artifact.name,
                    mimeType: response.artifact.mimeType,
                    data: response.artifact.data,
                  },
                }
              : {}),
          }),
        },
      );
      setMessages((current) => [...current, assistantMessage.message]);
      setActiveRoute(response.route);
      await loadConversations();
    } catch (requestError) {
      setError(errorText(requestError));
    } finally {
      setBusy(false);
      textareaRef.current?.focus();
    }
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Choose a PDF, JPEG, PNG, or WebP file.");
      return;
    }
    if (file.size === 0 || file.size > 6 * 1024 * 1024) {
      setError("Attachments must be no larger than 6 MB.");
      return;
    }

    setError("");
    setSelectedFile(file);
  }

  async function signOut() {
    setError("");
    try {
      await apiRequest<{ message: string }>("/auth/logout", { method: "POST" });
      setUser(null);
      setConversations([]);
      setActiveConversation(null);
      setMessages([]);
    } catch (requestError) {
      setError(errorText(requestError));
    }
  }

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] text-xs uppercase tracking-[0.18em] text-[#777]">
        <span className="mr-3 h-1.5 w-1.5 animate-pulse rounded-full bg-[#ddd]" />
        Opening your workspace
      </main>
    );
  }
  if (!user) return <AuthScreen onAuthenticated={handleAuthenticated} serviceError={error} />;

  return (
    <main className="workspace-shell relative flex h-dvh min-h-[520px] overflow-hidden bg-[#080808] text-[#ededed]">
      <div className="workspace-grain pointer-events-none absolute inset-0 z-0" />
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close conversation menu"
          className="fixed inset-0 z-20 bg-black/75 backdrop-blur-[2px] md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-[278px] shrink-0 flex-col border-r border-[#242424] bg-[#0c0c0c] transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[72px] items-center justify-between border-b border-[#222] px-5">
          <div className="flex items-center gap-3">
            <span className="brand-mark flex h-8 w-8 items-center justify-center border border-[#565656] text-[10px] font-semibold text-[#f2f2f2]">C</span>
            <span className="text-[13px] font-medium tracking-[0.02em] text-[#eee]">commonplace</span>
          </div>
          <span className="text-[9px] uppercase tracking-[0.18em] text-[#666]">01</span>
        </div>

        <div className="px-3 pb-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={startConversation}
            className="group h-10 w-full justify-start gap-3 rounded-none border-[#303030] bg-[#111] px-3 text-[11px] font-medium text-[#ddd] transition-all hover:border-[#666] hover:bg-[#171717] hover:text-white"
          >
            <span className="flex h-5 w-5 items-center justify-center border border-[#444] text-sm font-light leading-none text-[#aaa] transition-colors group-hover:border-[#888] group-hover:text-white">+</span>
            New conversation
          </Button>
        </div>
        <div className="flex items-center justify-between px-5 pb-3 pt-7 text-[9px] font-medium uppercase tracking-[0.19em] text-[#777]">
          <span>Recent</span>
          <span className="tabular-nums text-[#555]">{conversations.length.toString().padStart(2, "0")}</span>
        </div>

        <ScrollArea className="workspace-scrollbar min-h-0 flex-1 px-2">
          {conversations.length === 0 ? (
            <div className="mx-3 mt-2 border-t border-[#242424] py-4">
              <p className="text-[11px] leading-5 text-[#737373]">Your conversations will appear here.</p>
            </div>
          ) : (
            <div className="space-y-1 px-1 pb-3">
              {conversations.map((conversation, index) => (
                <button
                  type="button"
                  key={conversation._id}
                  onClick={() => void selectConversation(conversation)}
                  style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
                  className={`rise-in group w-full border border-transparent px-3 py-3 text-left transition-all duration-200 ${
                    activeConversation?._id === conversation._id
                      ? "border-[#292929] bg-[#141414]"
                      : "hover:border-[#222] hover:bg-[#111]"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className={`h-1 w-1 shrink-0 rounded-full transition-colors ${activeConversation?._id === conversation._id ? "bg-[#eee]" : "bg-[#444] group-hover:bg-[#888]"}`} />
                    <span className="block truncate text-[11px] font-medium text-[#d0d0d0]">{conversation.title}</span>
                  </span>
                  <span className="mt-2 block pl-3.5 text-[9px] tabular-nums text-[#666]">{conversationDate(conversation.updatedAt)}</span>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="border-t border-[#242424] p-3">
          <div className="mb-2 flex items-center gap-2 px-2 pt-2 text-[9px] uppercase tracking-[0.18em] text-[#666]">
            <span className="h-px w-4 bg-[#555]" />
            All agents ready
          </div>
          <div className="flex items-center gap-3 px-2 py-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#464646] bg-[#151515] text-[10px] font-medium text-[#e5e5e5]">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-medium text-[#ddd]">{user.name}</p>
              <p className="truncate text-[9px] text-[#777]">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={() => void signOut()}
              className="text-[9px] text-[#777] underline decoration-transparent underline-offset-4 transition-colors hover:text-white hover:decoration-[#888]"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <section className="relative z-[1] flex min-w-0 flex-1 flex-col bg-[#080808]">
        <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#222] bg-[#090909]/95 px-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open conversation menu"
              onClick={() => setSidebarOpen(true)}
              className="flex h-8 w-8 items-center justify-center border border-[#333] text-sm text-[#ddd] transition-colors hover:border-[#777] hover:text-white md:hidden"
            >
              <span className="leading-none">☰</span>
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-[13px] font-medium tracking-tight text-[#eee]">{activeConversation?.title ?? "New conversation"}</h1>
              <p className="mt-0.5 flex items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-[#777]">
                <span className="h-1 w-1 rounded-full bg-[#aaa]" />
                {activeRoute ? `${routeNames[activeRoute]} agent` : "Your workspace"}
              </p>
            </div>
          </div>
          <span className="hidden items-center gap-2 border border-[#292929] px-3 py-1.5 text-[9px] uppercase tracking-[0.14em] text-[#888] sm:flex">
            <span className="h-1 w-1 rounded-full bg-[#c4c4c4]" />
            Private workspace
          </span>
        </header>

        <div className="flex min-h-0 flex-1 flex-col">
          <ScrollArea className="workspace-scrollbar min-h-0 flex-1">
            <div className="mx-auto w-full max-w-[960px] px-5 pb-8 pt-8 sm:px-10 sm:pt-12">
              {messages.length === 0 && !loadingMessages ? (
                <div className="rise-in mx-auto mt-[5vh] max-w-[770px]">
                  <div className="flex items-center justify-between border-b border-[#222] pb-4">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-[#777]">A space for what’s next</p>
                    <p className="hidden text-[9px] tabular-nums text-[#555] sm:block">01 — 05 / AGENTS</p>
                  </div>
                  <div className="grid items-center gap-8 py-10 md:grid-cols-[minmax(0,1fr)_230px] md:gap-12 md:py-14">
                    <div>
                      <p className="mb-5 text-[10px] uppercase tracking-[0.17em] text-[#8a8a8a]">Start anywhere</p>
                      <h2 className="max-w-[570px] text-[42px] font-light leading-[1.02] tracking-[-0.065em] text-[#f4f4f4] sm:text-[60px]">
                        Bring the thought.
                        <br />
                        <span className="text-[#777]">Find the thread.</span>
                      </h2>
                      <p className="mt-6 max-w-[400px] text-[13px] leading-7 text-[#858585]">
                        Ask, make, research, or work through a problem. The right specialist joins when you need one.
                      </p>
                    </div>
                    <div aria-hidden="true" className="relative mx-auto hidden h-[210px] w-[210px] items-center justify-center md:flex">
                      <span className="absolute inset-0 rounded-full border border-[#282828]" />
                      <span className="absolute inset-[15px] rounded-full border border-[#343434] orbit-sweep" />
                      <span className="absolute inset-[39px] rounded-full border border-[#454545]" />
                      <span className="absolute inset-[61px] rounded-full border border-[#292929]" />
                      <span className="absolute h-[3px] w-[3px] rounded-full bg-white orbit-breathe" />
                      <span className="absolute left-1/2 top-[15px] h-[3px] w-[3px] rounded-full bg-[#d4d4d4]" />
                      <span className="absolute bottom-[38px] right-[37px] h-px w-9 rotate-45 bg-[#656565]" />
                    </div>
                  </div>
                  <div className="grid border-y border-[#252525] sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDraft("Help me think through a difficult decision.");
                        textareaRef.current?.focus();
                      }}
                      className="group border-b border-[#252525] px-1 py-4 text-left transition-colors hover:bg-white/[0.025] sm:border-r sm:px-4"
                    >
                      <span className="flex items-center justify-between gap-4">
                        <span>
                          <span className="block text-[11px] font-medium text-[#d4d4d4] transition-colors group-hover:text-white">Think something through</span>
                          <span className="mt-1.5 block text-[10px] text-[#707070]">Bring an open question or idea</span>
                        </span>
                        <span className="text-[9px] tabular-nums text-[#585858]">01</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDraft("Find recent, reliable sources about ");
                        textareaRef.current?.focus();
                      }}
                      className="group border-b border-[#252525] px-1 py-4 text-left transition-colors hover:bg-white/[0.025] sm:px-4"
                    >
                      <span className="flex items-center justify-between gap-4">
                        <span>
                          <span className="block text-[11px] font-medium text-[#d4d4d4] transition-colors group-hover:text-white">Research a subject</span>
                          <span className="mt-1.5 block text-[10px] text-[#707070]">Search the web and compare sources</span>
                        </span>
                        <span className="text-[9px] tabular-nums text-[#585858]">02</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDraft("Review this code and suggest a clear improvement:\n\n");
                        textareaRef.current?.focus();
                      }}
                      className="group px-1 py-4 text-left transition-colors hover:bg-white/[0.025] sm:border-r sm:border-[#252525] sm:px-4"
                    >
                      <span className="flex items-center justify-between gap-4">
                        <span>
                          <span className="block text-[11px] font-medium text-[#d4d4d4] transition-colors group-hover:text-white">Work on a piece of code</span>
                          <span className="mt-1.5 block text-[10px] text-[#707070]">Explain, debug, or refine an approach</span>
                        </span>
                        <span className="text-[9px] tabular-nums text-[#585858]">03</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="group px-1 py-4 text-left transition-colors hover:bg-white/[0.025] sm:px-4"
                    >
                      <span className="flex items-center justify-between gap-4">
                        <span>
                          <span className="block text-[11px] font-medium text-[#d4d4d4] transition-colors group-hover:text-white">Bring in a document</span>
                          <span className="mt-1.5 block text-[10px] text-[#707070]">Ask questions about a PDF or image</span>
                        </span>
                        <span className="text-[9px] tabular-nums text-[#585858]">04</span>
                      </span>
                    </button>
                  </div>
                  <div className="mt-6 flex items-center justify-between text-[9px] uppercase tracking-[0.15em] text-[#5f5f5f]">
                    <span>Chat · Code · Image · PDF · Search</span>
                    <span className="hidden sm:block">One continuous conversation</span>
                  </div>
                </div>
              ) : loadingMessages ? (
                <div className="rise-in flex items-center justify-center gap-3 py-16 text-[10px] uppercase tracking-[0.16em] text-[#777]">
                  <span className="h-1 w-1 rounded-full bg-[#ddd] loading-pulse" />
                  <span className="h-1 w-1 rounded-full bg-[#ddd] loading-pulse" />
                  <span className="h-1 w-1 rounded-full bg-[#ddd] loading-pulse" />
                  Loading conversation
                </div>
              ) : (
                <div className="space-y-9">
                  {messages.map((message, index) => (
                    <article
                      key={message._id}
                      style={{ animationDelay: `${Math.min(index, 6) * 35}ms` }}
                      className={`rise-in grid grid-cols-[minmax(0,1fr)] gap-2.5 ${
                        message.role === "user" ? "ml-auto max-w-[88%] sm:max-w-[78%]" : "mr-auto w-full"
                      }`}
                    >
                      <p className={`flex items-center gap-2 text-[9px] font-medium uppercase tracking-[0.17em] ${
                        message.role === "user" ? "justify-end text-[#777]" : "text-[#aaa]"
                      }`}>
                        {message.role === "assistant" && <span className="brand-mark flex h-5 w-5 items-center justify-center border border-[#454545] text-[7px] font-semibold text-[#ddd]">C</span>}
                        {message.role === "user" ? "You" : "Commonplace"}
                        {message.role === "user" && <span className="flex h-5 w-5 items-center justify-center border border-[#3b3b3b] bg-[#171717] text-[8px] text-[#bbb]">{user.name.slice(0, 1).toUpperCase()}</span>}
                      </p>
                      <div className={`message-copy min-w-0 text-[13px] leading-[1.85] sm:text-[14px] ${
                        message.role === "user"
                          ? "border border-[#292929] bg-[#111] px-4 py-3 text-[#e4e4e4] sm:px-5 sm:py-4"
                          : "border-l border-[#454545] py-1 pl-4 text-[#cdcdcd] sm:pl-5"
                      }`}>
                        {message.attachment && (
                          message.attachment.mimeType.startsWith("image/") ? (
                            <Image
                              src={`data:${message.attachment.mimeType};base64,${message.attachment.data}`}
                              alt={message.attachment.name}
                              width={1200}
                              height={900}
                              unoptimized
                              className="mb-3 max-h-[480px] max-w-full border border-[#333] object-contain"
                            />
                          ) : (
                            <div className="mb-3 flex max-w-[320px] items-center gap-3 border border-[#333] bg-[#0b0b0b] px-3 py-2">
                              <span className="border border-[#555] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#ddd]">PDF</span>
                              <span className="truncate text-xs text-[#d0d0d0]">{message.attachment.name}</span>
                            </div>
                          )
                        )}
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            a: ({ children, ...props }) => (
                              <a
                                {...props}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#eee] underline decoration-[#666] underline-offset-4 hover:decoration-white"
                              >
                                {children}
                              </a>
                            ),
                            pre: ({ children }) => <>{children}</>,
                            code: ({ children, className }) => {
                              const rawCode = String(children);
                              const isBlockCode =
                                Boolean(className) || rawCode.includes("\n");
                              if (!isBlockCode) {
                                return (
                                  <code className="border border-[#303030] bg-[#111] px-1 py-0.5 font-mono text-[0.9em] text-[#e2e2e2]">
                                    {children}
                                  </code>
                                );
                              }

                              const language = /language-([\w+#.-]+)/.exec(
                                className ?? "",
                              )?.[1];
                              return (
                                <CodeBlock
                                  code={rawCode.replace(/\n$/, "")}
                                  language={language}
                                />
                              );
                            },
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    </article>
                  ))}
                  {busy && (
                    <article className="rise-in mr-auto grid w-full grid-cols-1 gap-3">
                      <p className="flex items-center gap-2 text-[9px] font-medium uppercase tracking-[0.17em] text-[#aaa]">
                        <span className="brand-mark flex h-5 w-5 items-center justify-center border border-[#454545] text-[7px] font-semibold text-[#ddd]">C</span>
                        Commonplace
                      </p>
                      <p className="flex items-center gap-2 border-l border-[#454545] py-1 pl-5 text-[12px] text-[#777]">
                        <span className="flex items-center gap-1">
                          <span className="h-1 w-1 rounded-full bg-[#ddd] loading-pulse" />
                          <span className="h-1 w-1 rounded-full bg-[#ddd] loading-pulse" />
                          <span className="h-1 w-1 rounded-full bg-[#ddd] loading-pulse" />
                        </span>
                        Thinking through it
                      </p>
                    </article>
                  )}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="shrink-0 border-t border-[#222] bg-[#090909] px-4 pb-4 pt-4 sm:px-8 sm:pb-6">
            <div className="mx-auto max-w-[960px]">
              {error && (
                <p role="alert" className="mb-3 border-l border-[#b66] bg-[#1a1111] px-3 py-2 text-xs leading-5 text-[#e2a5a5]">{error}</p>
              )}
              <form onSubmit={(event) => void sendMessage(event)} className="group/composer relative border border-[#303030] bg-[#101010] transition-colors duration-300 focus-within:border-[#686868]">
                <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#777] to-transparent opacity-0 transition-opacity duration-300 group-focus-within/composer:opacity-70" />
                {selectedFile && (
                  <div className="flex items-center justify-between border-b border-[#292929] bg-[#151515] px-4 py-2.5">
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className="border border-[#555] px-1.5 py-1 text-[8px] uppercase tracking-[0.12em] text-[#ccc]">
                        {selectedFile.type === "application/pdf" ? "PDF" : "IMG"}
                      </span>
                      <span className="truncate text-[11px] text-[#d2d2d2]">{selectedFile.name}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="shrink-0 px-2 text-[9px] uppercase tracking-[0.12em] text-[#777] transition-colors hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <Textarea
                  ref={textareaRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  placeholder="Write a message…"
                  aria-label="Message"
                  rows={2}
                  disabled={busy}
                  className="min-h-[92px] resize-none rounded-none border-0 bg-transparent px-4 py-4 text-[13px] leading-6 text-[#eee] placeholder:text-[#686868] focus-visible:ring-0 sm:min-h-[100px] sm:px-5"
                />
                <div className="flex items-center justify-between border-t border-[#242424] bg-[#0d0d0d] px-3 py-2.5 sm:px-4">
                  <div className="flex items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf,image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 text-[10px] font-medium text-[#aaa] transition-colors hover:text-white disabled:opacity-50"
                    >
                      <span className="flex h-5 w-5 items-center justify-center border border-[#414141] text-sm font-light leading-none text-[#bbb] transition-colors group-hover/composer:border-[#777]">+</span>
                      <span className="hidden sm:inline">Attach a file</span>
                      <span className="sm:hidden">Attach</span>
                    </button>
                    <span className="hidden text-[9px] text-[#5e5e5e] sm:inline">PDF, JPG, PNG, WEBP · 6 MB max</span>
                  </div>
                  <Button
                    type="submit"
                    disabled={busy || (!draft.trim() && !selectedFile)}
                    className="h-8 rounded-none bg-[#e6e6e6] px-3.5 text-[10px] font-semibold tracking-wide text-[#0b0b0b] transition-all hover:bg-white disabled:bg-[#272727] disabled:text-[#666]"
                  >
                    {busy ? "Working" : "Send"}
                    {!busy && <span className="ml-1.5 text-xs leading-none">↑</span>}
                  </Button>
                </div>
              </form>
              <div className="mt-2 flex items-center justify-between px-1 text-[9px] text-[#575757]">
                <span className="hidden sm:block">Enter to send · Shift + Enter for a new line</span>
                <span className="sm:hidden">Enter to send</span>
                <span>Review important information independently.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
