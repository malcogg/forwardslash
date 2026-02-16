"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const PILL_SUGGESTIONS = [
  "What is ForwardSlash.Chat?",
  "How much does it cost?",
  "How does it work?",
  "Can I see a demo?",
];

const QUESTION_SUGGESTIONS = [
  "What services do you offer?",
  "Tell me about your products",
  "How do I get in touch?",
];

const FALLBACK =
  "Sorry, I'm still learning! Ask me about pricing, how it works, domain setup, scanning your site, or anything else about ForwardSlash.Chat.";

const TYPING_DELAY_MS = 1600;

function getHardcodedResponse(message: string): string | null {
  const q = message.toLowerCase().trim();
  if (!q) return null;

  const pairs: { keywords: string[]; answer: string }[] = [
    {
      keywords: ["what is", "what does forwardslash do", "what is forwardslash.chat"],
      answer:
        "ForwardSlash.Chat gives your business a custom AI chatbot trained only on your website content. It lives at chat.yourdomain.com or yourdomain.com/chat, answers 24/7 using just your info — no generic AI, no data sharing. Pay once, no monthly fees. Hosting included.",
    },
    {
      keywords: ["how much", "pricing", "cost", "plans", "bundles", "price"],
      answer: `One-time payment only — no monthly fees!
• 1-Year Starter: $550
• 2-Year Recommended: $850 (save $190)
• 3-Year: $1,250
After prepaid period, optional renewal $495/year. Optional $99 DNS help. Scan your site to see your exact price.`,
    },
    {
      keywords: ["how does it work", "how to get started", "process", "steps"],
      answer: `Super easy: Enter your website URL — we scan and train the AI on your content.
Customize branding (logo, colors).
Connect your domain (chat.yourdomain.com or yourdomain.com/chat).
Pay once — we deploy it live in 3–10 days.
No monthly fees, hosting included.`,
    },
    {
      keywords: ["scan", "crawl", "add my site", "how to scan"],
      answer:
        "Just enter your website URL in the dashboard. We crawl your pages, pull services/FAQs/products/blog, and train your private AI. No tech skills needed — we do everything.",
    },
    {
      keywords: ["domain", "subdomain", "chat.mywebsite.com", "mybusiness.com/chat", "custom domain"],
      answer:
        "Your chatbot lives on your own domain — subdomain like chat.mybusiness.com or path like mybusiness.com/chat. Add one DNS record (we can help for $99). It becomes part of your site.",
    },
    {
      keywords: ["monthly", "subscription", "fees", "recurring", "is there monthly fee"],
      answer:
        "No monthly fees — ever. Pay one time for creation + hosting during your chosen period. Optional renewal after that is $495/year if you want us to keep hosting.",
    },
    {
      keywords: ["demo", "see it live", "try it", "test", "demo chat"],
      answer:
        "You're chatting with the demo right now! Ask anything about ForwardSlash.Chat — pricing, setup, features — or scan your own site to see a custom version.",
    },
    {
      keywords: ["dashboard", "how to use dashboard", "what is dashboard"],
      answer:
        "After payment, you get a dashboard to track your order, upload extra files, customize branding (logo/colors), view DNS instructions, and see your live chatbot URL once deployed.",
    },
    {
      keywords: ["branding", "customize", "logo", "colors"],
      answer:
        "In your dashboard, upload your logo/favicon, pick accent/background colors — your chatbot will match your brand perfectly.",
    },
    {
      keywords: ["how long", "delivery time", "when will it be ready"],
      answer:
        "We deliver in 3–10 business days after payment and DNS setup. Scan your site first to get started fast!",
    },
    {
      keywords: ["help", "support", "contact", "questions"],
      answer:
        "We're here to help! Reply here or email support@forwardslash.chat. For DNS or custom needs, we offer $99 setup help.",
    },
  ];

  for (const { keywords, answer } of pairs) {
    for (const kw of keywords) {
      if (q.includes(kw)) return answer;
    }
  }
  return null;
}

function MarkdownText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining) {
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    const codeMatch = remaining.match(/`([^`]+)`/);

    let match: RegExpMatchArray | null = null;
    let type: "link" | "bold" | "code" = "link";
    let idx = remaining.length;

    if (linkMatch && linkMatch.index !== undefined && linkMatch.index < idx) {
      match = linkMatch;
      type = "link";
      idx = linkMatch.index;
    }
    if (boldMatch && boldMatch.index !== undefined && boldMatch.index < idx) {
      match = boldMatch;
      type = "bold";
      idx = boldMatch.index;
    }
    if (codeMatch && codeMatch.index !== undefined && codeMatch.index < idx) {
      match = codeMatch;
      type = "code";
      idx = codeMatch.index;
    }

    if (match && match.index !== undefined) {
      if (idx > 0) {
        parts.push(
          <span key={key++}>
            {remaining.slice(0, idx).split("\n").map((line, i) => (
              <span key={i}>{line}{i < remaining.slice(0, idx).split("\n").length - 1 ? <br /> : null}</span>
            ))}
          </span>
        );
      }
      if (type === "link") {
        parts.push(
          <a key={key++} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-primary underline">
            {match[1]}
          </a>
        );
      } else if (type === "bold") {
        parts.push(<strong key={key++}>{match[1]}</strong>);
      } else if (type === "code") {
        parts.push(<code key={key++} className="bg-muted px-1 rounded text-sm">{match[1]}</code>);
      }
      remaining = remaining.slice(idx + match[0].length);
    } else {
      parts.push(
        <span key={key++}>
          {remaining.split("\n").map((line, i) => (
            <span key={i}>{line}{i < remaining.split("\n").length - 1 ? <br /> : null}</span>
          ))}
        </span>
      );
      break;
    }
  }

  return <>{parts}</>;
}

type Message = { role: "user" | "assistant"; content: string; id?: string };

export default function DemoChatPage() {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || isLoading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: t, id: `u-${Date.now()}` }]);
    setIsLoading(true);

    setTimeout(() => {
      const reply = getHardcodedResponse(t) ?? FALLBACK;
      setMessages((prev) => [...prev, { role: "assistant", content: reply, id: `a-${Date.now()}` }]);
      setIsLoading(false);
    }, TYPING_DELAY_MS);
  };

  return (
    <div className="flex flex-col h-dvh bg-background">
      <header className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-medium">/</span>
          </div>
          <span className="font-semibold">ForwardSlash.Chat</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to site
          </Link>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {messages.length === 0 ? (
            <>
              <p className="text-lg font-medium mb-1">Hi! I&apos;m the ForwardSlash demo assistant.</p>
              <p className="text-muted-foreground mb-6">Ask me about our product, pricing, how it works, or what&apos;s included.</p>

              <div className="grid grid-cols-4 gap-1.5 mb-6">
                {PILL_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="px-2 py-1.5 rounded-lg text-[11px] leading-tight text-left border bg-card hover:bg-accent hover:text-accent-foreground transition-colors min-w-0"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {QUESTION_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="block w-full text-left text-sm text-muted-foreground hover:text-foreground py-2"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-6">
              {messages.map((m, i) => (
                <div key={m.id ?? `msg-${i}`} className={m.role === "user" ? "flex justify-end" : ""}>
                  <div
                    className={`inline-block max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/80"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <MarkdownText text={m.content} />
                      </div>
                    ) : (
                      m.content
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="inline-block px-4 py-3 rounded-2xl bg-muted/80 text-muted-foreground text-sm">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t shrink-0">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2 rounded-xl border bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
              placeholder="Ask about ForwardSlash.Chat..."
              className="flex-1 px-4 py-3 bg-transparent placeholder:text-muted-foreground focus:outline-none text-sm"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">Demo chatbot · Powered by ForwardSlash.Chat</p>
        </div>
      </div>
    </div>
  );
}
