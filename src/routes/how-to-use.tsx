import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/how-to-use")({
  head: () => ({
    meta: [
      { title: "How to Use Zapr — Step-by-Step Guide" },
      { name: "description", content: "Learn how to convert PDFs, Word, Excel and images with Zapr in a few clicks — fully in your browser." },
      { property: "og:title", content: "How to Use Zapr — Step-by-Step Guide" },
      { property: "og:description", content: "A quick walkthrough of every Zapr conversion tool." },
      { property: "og:url", content: "https://zepr.lovable.app/how-to-use" },
    ],
    links: [{ rel: "canonical", href: "https://zepr.lovable.app/how-to-use" }],
  }),
  component: HowToUsePage,
});

function HowToUsePage() {
  return (
    <main className="min-h-screen px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="font-mono text-xs text-muted-foreground hover:text-primary">
          ← Back to Zapr
        </Link>

        <h1 className="mt-6 font-display text-4xl md:text-5xl font-bold tracking-tight">
          How to use Zapr
        </h1>
        <p className="mt-3 text-muted-foreground">
          A quick guide to convert your files safely, right in your browser.
        </p>

        <div className="mt-10 space-y-8">
          <section>
            <h2 className="text-xl font-semibold tracking-tight">1. Pick a tool</h2>
            <p className="mt-2 text-muted-foreground">
              Choose the conversion you need from the toolbar — PDF, Images, Word, or Excel. Click the tool card to select it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight">2. Drop your file(s)</h2>
            <p className="mt-2 text-muted-foreground">
              Drag and drop your file onto the drop zone, or click to browse. Some tools accept multiple files (like Images → PDF).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight">3. Adjust settings (optional)</h2>
            <p className="mt-2 text-muted-foreground">
              For Word ↔ Excel conversions, you can choose heading levels and whether to include paragraph text as a Content sheet.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight">4. Preview & download</h2>
            <p className="mt-2 text-muted-foreground">
              Hit <strong>Convert</strong> and preview the result. If it looks good, download it. Batch conversions let you preview each file before grabbing the ZIP.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight">5. Everything stays private</h2>
            <p className="mt-2 text-muted-foreground">
              All conversions run locally in your browser. Your files are never uploaded to any server.
            </p>
          </section>
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold">Need help?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            If something is not working, visit the{" "}
            <Link to="/contact" className="text-primary underline-offset-4 hover:underline">
              Contact
            </Link>{" "}
            page to report a bug.
          </p>
        </div>

        <SiteFooter />
      </div>
    </main>
  );
}
