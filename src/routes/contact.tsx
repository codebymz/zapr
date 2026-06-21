import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteFooter } from "@/components/SiteFooter";

// TODO: replace with your real contact address.
const CONTACT_EMAIL = "zzawar521@gmail.com";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Bug Reports · Zapr" },
      { name: "description", content: "Report a bug, share feedback, or get in touch with the Zapr team." },
      { property: "og:title", content: "Contact & Bug Reports · Zapr" },
      { property: "og:description", content: "Reach the Zapr team — report bugs or share feedback." },
      { property: "og:url", content: "https://zepr.lovable.app/contact" },
    ],
    links: [{ rel: "canonical", href: "https://zepr.lovable.app/contact" }],
  }),
  component: ContactPage,
});

type Kind = "bug" | "feedback" | "other";

function ContactPage() {
  const [kind, setKind] = useState<Kind>("bug");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please describe the issue first");
      return;
    }
    const subject = encodeURIComponent(
      `[Zapr · ${kind.toUpperCase()}] ${name ? `from ${name}` : "Report"}`,
    );
    const body = encodeURIComponent(
      `Type: ${kind}\nFrom: ${name || "(anonymous)"} <${email || "n/a"}>\n\n${message}\n\n---\nBrowser: ${navigator.userAgent}`,
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    toast.success("Opening your email app…", {
      description: "If nothing opens, copy the address from the page.",
    });
  };

  return (
    <main className="min-h-screen px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="font-mono text-xs text-muted-foreground hover:text-primary">
          ← Back to Zapr
        </Link>

        <h1 className="mt-6 font-display text-4xl md:text-5xl font-bold tracking-tight">
          Contact & bug reports
        </h1>
        <p className="mt-3 text-muted-foreground">
          Found a broken conversion or have a suggestion? Tell us below or email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline-offset-4 hover:underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>

        <form onSubmit={submit} className="mt-10 space-y-5 rounded-2xl border border-border bg-card p-6">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
              Type
            </label>
            <div className="flex flex-wrap gap-2">
              {(["bug", "feedback", "other"] as Kind[]).map((k) => (
                <button
                  type="button"
                  key={k}
                  onClick={() => setKind(k)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
                    kind === k
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card hover:bg-secondary"
                  }`}
                >
                  {k === "bug" ? "🐞 Bug" : k === "feedback" ? "💡 Feedback" : "✉️ Other"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Your name <span className="opacity-60">(optional)</span>
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="Ada Lovelace"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Email <span className="opacity-60">(optional)</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
              {kind === "bug" ? "What went wrong?" : "Message"}
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
              placeholder={
                kind === "bug"
                  ? "e.g. PDF → DOCX skipped the second page of my file."
                  : "Tell us what you're thinking…"
              }
              required
            />
            {kind === "bug" && (
              <p className="mt-2 text-xs text-muted-foreground">
                Tip: include the conversion you tried, file type, and roughly the file size.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:scale-[1.01]"
          >
            Send via email →
          </button>
          <p className="text-xs text-muted-foreground text-center">
            Submitting opens your email client — Zapr never uploads your message.
          </p>
        </form>

        <SiteFooter />
      </div>
    </main>
  );
}
