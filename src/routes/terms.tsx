import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions · Zapr" },
      { name: "description", content: "Terms for using Zapr, the free in-browser file converter." },
      { property: "og:title", content: "Terms & Conditions · Zapr" },
      { property: "og:description", content: "Terms of use for Zapr's in-browser file conversion tools." },
      { property: "og:url", content: "https://zepr.lovable.app/terms" },
    ],
    links: [{ rel: "canonical", href: "https://zepr.lovable.app/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <main className="min-h-screen px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="font-mono text-xs text-muted-foreground hover:text-primary">
          ← Back to Zapr
        </Link>

        <h1 className="mt-6 font-display text-4xl md:text-5xl font-bold tracking-tight">
          Terms & Conditions
        </h1>
        <p className="mt-3 text-sm text-muted-foreground font-mono">
          By using Zapr you agree to the following terms.
        </p>

        <div className="mt-10 space-y-8 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="font-display text-2xl font-semibold mb-2">Use of the service</h2>
            <p>
              Zapr is provided as a free, in-browser tool for converting files
              between common formats. You are responsible for the files you
              process and for ensuring you have the right to convert them.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-2">No warranty</h2>
            <p>
              The service is provided "as is" without warranties of any kind.
              Conversion quality, especially for complex documents (e.g.
              PDF → DOCX layout reconstruction), is best-effort. Always verify
              important outputs before relying on them.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-2">Acceptable use</h2>
            <p>
              Do not use Zapr to process content that is illegal in your
              jurisdiction or that infringes the rights of others.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-2">Liability</h2>
            <p>
              To the maximum extent permitted by law, the Zapr team is not
              liable for any loss, damage, or data issue arising from use of the
              app.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-2">Changes</h2>
            <p>
              These terms may be updated over time. Continued use of the app
              after changes means you accept the updated terms.
            </p>
          </section>

          <p className="text-xs font-mono text-muted-foreground pt-4 border-t border-border">
            This is template wording, not legal advice. Replace with terms
            reviewed by your own counsel before commercial use.
          </p>
        </div>

        <SiteFooter />
      </div>
    </main>
  );
}
