import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy · Zapr" },
      { name: "description", content: "How Zapr handles your files: everything runs locally in your browser, nothing is uploaded." },
      { property: "og:title", content: "Privacy Policy · Zapr" },
      { property: "og:description", content: "Zapr processes files entirely in your browser — no uploads, no tracking." },
      { property: "og:url", content: "https://zepr.lovable.app/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://zepr.lovable.app/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="min-h-screen px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="font-mono text-xs text-muted-foreground hover:text-primary">
          ← Back to Zapr
        </Link>

        <h1 className="mt-6 font-display text-4xl md:text-5xl font-bold tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-muted-foreground font-mono">
          This page is maintained by the Zapr team to answer common privacy questions about the app.
        </p>

        <div className="mt-10 space-y-8 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="font-display text-2xl font-semibold mb-2">In short</h2>
            <p>
              Zapr is a client-side converter. Your files are processed entirely
              inside your browser. We do not upload, store, or transmit your
              documents or images to any server.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-2">Data we collect</h2>
            <p>
              The app itself does not collect personal information through forms,
              accounts, or analytics integrations. The hosting platform that
              serves Zapr may receive standard request metadata (such as IP
              address and user-agent) for the purpose of delivering the page.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-2">Files you convert</h2>
            <p>
              Conversions (Images ↔ PDF, PDF ↔ DOCX, image format changes) run
              locally using JavaScript libraries loaded into your browser. The
              file contents never leave your device.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-2">Cookies & tracking</h2>
            <p>
              Zapr does not set tracking cookies or use third-party analytics in
              this version of the app.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-2">Contact</h2>
            <p>
              Questions about this policy? Use the{" "}
              <Link to="/contact" className="text-primary underline-offset-4 hover:underline">
                contact page
              </Link>
              .
            </p>
          </section>

          <p className="text-xs font-mono text-muted-foreground pt-4 border-t border-border">
            This page describes app-visible behavior. It is not a certification
            or legal advice. Update with your organization's specifics before
            relying on it in production.
          </p>
        </div>

        <SiteFooter />
      </div>
    </main>
  );
}
