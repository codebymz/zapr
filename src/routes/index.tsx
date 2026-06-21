import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { PreviewModal } from "@/components/PreviewModal";
import { SiteFooter } from "@/components/SiteFooter";
import {
  ConversionType,
  ConvertedFile,
  convertImageFormat,
  csvToXlsx,
  docxToPdf,
  docxToXlsx,
  downloadFile,
  imagesToPdf,
  mdToDocx,
  pdfToDocx,
  pdfToImages,
  pdfToText,
  validateFile,
  xlsxToCsv,
  xlsxToDocx,
} from "@/lib/converters";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zapr — Free In-Browser File Converter (PDF, DOCX, Excel, Images)" },
      {
        name: "description",
        content:
          "Convert PDF ↔ DOCX, DOCX ↔ Excel, Images ↔ PDF and PNG / JPG / WEBP — free, fast, and 100% in your browser. No uploads, no sign-up.",
      },
      { property: "og:title", content: "Zapr — Free In-Browser File Converter" },
      {
        property: "og:description",
        content:
          "All-in-one converter for PDF, Word, Excel and images. Runs entirely on your device — nothing is ever uploaded.",
      },
      { property: "og:url", content: "https://zepr.lovable.app/" },
      { property: "twitter:title", content: "Zapr — Free In-Browser File Converter" },
      {
        property: "twitter:description",
        content: "PDF, DOCX, Excel and image conversions — instant and private.",
      },
    ],
    links: [{ rel: "canonical", href: "https://zepr.lovable.app/" }],
  }),
  component: Index,
});

type Tool = {
  id: ConversionType;
  label: string;
  sub: string;
  accept: string;
  multi: boolean;
  group: "PDF" | "Image" | "Docs" | "Data";
};

const TOOLS: Tool[] = [
  { id: "images-to-pdf", label: "Images → PDF", sub: "Bundle photos into one PDF", accept: "image/*", multi: true, group: "PDF" },
  { id: "pdf-to-images", label: "PDF → Images", sub: "Extract every page as PNG", accept: "application/pdf", multi: false, group: "PDF" },
  { id: "pdf-to-text", label: "PDF → Text", sub: "Plain .txt from a PDF", accept: "application/pdf", multi: false, group: "PDF" },
  { id: "docx-to-pdf", label: "DOCX → PDF", sub: "Word document to PDF", accept: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", multi: false, group: "Docs" },
  { id: "pdf-to-docx", label: "PDF → DOCX", sub: "Extract text into Word", accept: "application/pdf", multi: false, group: "Docs" },
  { id: "docx-to-xlsx", label: "DOCX → Excel", sub: "Tables & text into a workbook", accept: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", multi: false, group: "Docs" },
  { id: "xlsx-to-docx", label: "Excel → DOCX", sub: "Sheets become Word tables", accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", multi: false, group: "Docs" },
  { id: "md-to-docx", label: "Markdown → DOCX", sub: "Render .md as a Word doc", accept: "text/markdown", multi: false, group: "Docs" },
  { id: "xlsx-to-csv", label: "Excel → CSV", sub: "Flatten sheets to CSV", accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", multi: false, group: "Data" },
  { id: "csv-to-xlsx", label: "CSV → Excel", sub: "CSV into a workbook", accept: "text/csv", multi: false, group: "Data" },
  { id: "image-to-png", label: "→ PNG", sub: "Convert any image to PNG", accept: "image/*", multi: true, group: "Image" },
  { id: "image-to-jpg", label: "→ JPG", sub: "Convert any image to JPG", accept: "image/*", multi: true, group: "Image" },
  { id: "image-to-webp", label: "→ WEBP", sub: "Modern lightweight format", accept: "image/*", multi: true, group: "Image" },
];

function Index() {
  const [active, setActive] = useState<Tool>(TOOLS[0]);
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<ConvertedFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [previewFile, setPreviewFile] = useState<ConvertedFile | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [zipping, setZipping] = useState(false);
  const [includeContent, setIncludeContent] = useState(true);
  const [maxHeadingLevel, setMaxHeadingLevel] = useState<1 | 2 | 3 | 4 | 5 | 6>(3);
  const [headingError, setHeadingError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const showSettings = active.id === "docx-to-xlsx" || active.id === "xlsx-to-docx";

  const pick = (tool: Tool) => {
    setActive(tool);
    setFiles([]);
    setResults([]);
    setError(null);
    setHeadingError(null);
  };

  const onFiles = useCallback((list: FileList | null) => {
    if (!list) return;
    const arr = Array.from(list);
    const picked = active.multi ? arr : arr.slice(0, 1);
    for (const f of picked) {
      const err = validateFile(f, active.accept);
      if (err) {
        setError(err);
        toast.error("Invalid file", { description: err });
        return;
      }
    }
    setFiles(picked);
    setResults([]);
    setError(null);
  }, [active]);

  const run = async () => {
    if (!files.length) return;
    if (showSettings) {
      if (![1, 2, 3, 4, 5, 6].includes(maxHeadingLevel)) {
        const msg = `Invalid heading level "${maxHeadingLevel}". Choose a value between H1 and H6 (1–6).`;
        setHeadingError(msg);
        toast.error("Invalid setting", { description: msg });
        return;
      }
      setHeadingError(null);
    }
    setBusy(true);
    setError(null);
    setProgress(0);
    setProgressLabel("Starting…");
    const toastId = toast.loading(`Converting · ${active.label}`, {
      description: "Preparing…",
    });
    const onProgress = (pct: number, label?: string) => {
      setProgress(pct);
      if (label) setProgressLabel(label);
      toast.loading(`Converting · ${active.label}`, {
        id: toastId,
        description: `${label ?? ""} · ${pct}%`,
      });
    };
    try {
      let out: ConvertedFile[] = [];
      if (active.id === "images-to-pdf") {
        onProgress(10, "Bundling images");
        out = [await imagesToPdf(files)];
        onProgress(100, "Done");
      } else if (active.id === "pdf-to-images") {
        onProgress(10, "Rendering pages");
        out = await pdfToImages(files[0]);
        onProgress(100, "Done");
      } else if (active.id === "docx-to-pdf") {
        out = [await docxToPdf(files[0], onProgress)];
      } else if (active.id === "pdf-to-docx") {
        out = [await pdfToDocx(files[0], onProgress)];
      } else if (active.id === "docx-to-xlsx") {
        out = [await docxToXlsx(files[0], onProgress, { includeContent, maxHeadingLevel })];
      } else if (active.id === "xlsx-to-docx") {
        out = [await xlsxToDocx(files[0], onProgress, { maxHeadingLevel })];
      } else if (active.id === "pdf-to-text") {
        out = [await pdfToText(files[0], onProgress)];
      } else if (active.id === "xlsx-to-csv") {
        out = [await xlsxToCsv(files[0], onProgress)];
      } else if (active.id === "csv-to-xlsx") {
        out = [await csvToXlsx(files[0], onProgress)];
      } else if (active.id === "md-to-docx") {
        out = [await mdToDocx(files[0], onProgress)];
      } else {
        const fmt = active.id === "image-to-jpg" ? "jpg" : active.id === "image-to-png" ? "png" : "webp";
        onProgress(20, "Re-encoding");
        out = await Promise.all(files.map((f) => convertImageFormat(f, fmt)));
        onProgress(100, "Done");
      }
      setResults(out);
      setSelected(new Set(out.map((_, i) => i)));
      if (out.length === 1) setPreviewFile(out[0]);
      toast.success("Conversion complete", {
        id: toastId,
        description: `${out.length} file${out.length > 1 ? "s" : ""} ready to download.`,
      });
    } catch (e: any) {
      const msg = e?.message ?? "Conversion failed";
      setError(msg);
      toast.error("Conversion failed", { id: toastId, description: msg });
    } finally {
      setBusy(false);
      setTimeout(() => {
        setProgress(0);
        setProgressLabel("");
      }, 800);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-display text-xl font-bold">
              Z
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold leading-none">Zapr</h1>
              <p className="text-xs text-muted-foreground font-mono">universal converter</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 text-xs font-mono text-muted-foreground backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px] shadow-primary" />
            100% in-browser · zero uploads
          </div>
        </header>

        {/* Hero */}
        <section className="mb-10 max-w-3xl">
          <h2 className="font-display text-5xl md:text-7xl font-bold leading-[0.95] tracking-tight">
            Convert anything.{" "}
            <span className="text-primary">Instantly.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl">
            Images, PDFs, formats — switched in a blink, right inside your browser.
            Nothing ever touches a server.
          </p>
        </section>

        {/* Tool picker */}
        <section className="mb-6">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Pick a tool
          </p>
          <div className="flex flex-wrap gap-2">
            {TOOLS.map((t) => {
              const isActive = t.id === active.id;
              return (
                <button
                  key={t.id}
                  onClick={() => pick(t)}
                  className={`group rounded-xl border px-4 py-3 text-left transition-all ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                      : "border-border bg-card hover:border-primary/40 hover:bg-card/80"
                  }`}
                >
                  <div className="font-display font-semibold">{t.label}</div>
                  <div className={`text-xs ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {t.sub}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Drop zone */}
        <section
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            onFiles(e.dataTransfer.files);
          }}
          className={`rounded-2xl border-2 border-dashed p-10 md:p-16 text-center transition-all ${
            dragging
              ? "border-primary bg-primary/5"
              : "border-border bg-card/40 hover:border-primary/40"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={
              active.accept === "text/csv"
                ? ".csv,text/csv"
                : active.accept === "text/markdown"
                ? ".md,.markdown,text/markdown"
                : active.accept
            }
            multiple={active.multi}
            onChange={(e) => onFiles(e.target.files)}
            className="hidden"
          />
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <h3 className="font-display text-2xl font-semibold mb-2">
            Drop {active.multi ? "files" : "a file"} here
          </h3>
          <p className="text-muted-foreground mb-6 text-sm">
            or click to browse ·{" "}
            {active.accept.startsWith("image/")
              ? "any image"
              : active.accept.includes("wordprocessingml")
              ? "DOCX only"
              : active.accept.includes("spreadsheetml")
              ? "XLSX only"
              : active.accept === "text/csv"
              ? "CSV only"
              : active.accept === "text/markdown"
              ? "Markdown only"
              : "PDF only"}
          </p>
          <button
            onClick={() => inputRef.current?.click()}
            className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-transform hover:scale-105"
          >
            Choose {active.multi ? "files" : "file"}
          </button>

          {files.length > 0 && (
            <div className="mt-8 flex flex-wrap justify-center gap-2 text-left">
              {files.map((f, i) => (
                <div key={i} className="rounded-lg bg-secondary px-3 py-2 text-xs font-mono">
                  {f.name} <span className="text-muted-foreground">· {(f.size / 1024).toFixed(0)} KB</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Settings */}
        {showSettings && (
          <section className="mt-6 rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Conversion settings
              </span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-mono uppercase text-muted-foreground">
                {active.label}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {active.id === "docx-to-xlsx" && (
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background/50 p-3 hover:border-primary/40">
                  <input
                    type="checkbox"
                    checked={includeContent}
                    onChange={(e) => setIncludeContent(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-primary"
                  />
                  <div>
                    <div className="text-sm font-semibold">Include paragraph text as a Content sheet</div>
                    <div className="text-xs text-muted-foreground">
                      Adds a "Content" sheet with body paragraphs, list items, and headings.
                    </div>
                  </div>
                </label>
              )}
              <div className="rounded-lg border border-border bg-background/50 p-3">
                <div className="mb-2 text-sm font-semibold">
                  {active.id === "docx-to-xlsx" ? "Include headings up to" : "Sheet title heading level"}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[1, 2, 3, 4, 5, 6].map((lv) => (
                    <button
                      key={lv}
                      onClick={() => setMaxHeadingLevel(lv as 1 | 2 | 3 | 4 | 5 | 6)}
                      className={`rounded-md border px-3 py-1.5 text-xs font-mono font-semibold transition ${
                        maxHeadingLevel === lv
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      H{lv}
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {active.id === "docx-to-xlsx"
                    ? `Captures H1–H${maxHeadingLevel} in the Content sheet.`
                    : `Sheet names render as H${maxHeadingLevel}.`}
                </div>
                {headingError && (
                  <div className="mt-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
                    {headingError}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Action */}
        {files.length > 0 && (
          <section className="mt-6 rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm">
                <span className="font-semibold">{files.length}</span>{" "}
                <span className="text-muted-foreground">file{files.length > 1 ? "s" : ""} ready · {active.label}</span>
              </div>
              <button
                onClick={run}
                disabled={busy}
                className="rounded-full bg-accent px-6 py-3 font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-50"
              >
                {busy ? "Converting…" : "Convert →"}
              </button>
            </div>

            {busy && (
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs font-mono text-muted-foreground">
                  <span>{progressLabel || "Working…"}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-out shadow-[0_0_12px] shadow-primary"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </section>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
            {error}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <section className="mt-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-2xl font-semibold">
                  Review & confirm ⚡
                </h3>
                {results.length > 1 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Preview each file, then download {selected.size} of {results.length} as a ZIP.
                  </p>
                )}
              </div>
              {results.length > 1 && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() =>
                      setSelected(
                        selected.size === results.length
                          ? new Set()
                          : new Set(results.map((_, i) => i)),
                      )
                    }
                    className="rounded-full border border-border px-3 py-2 text-xs font-semibold hover:bg-secondary transition"
                  >
                    {selected.size === results.length ? "Deselect all" : "Select all"}
                  </button>
                  <button
                    disabled={zipping || selected.size === 0}
                    onClick={async () => {
                      setZipping(true);
                      const tId = toast.loading("Packaging ZIP…");
                      try {
                        const JSZip = (await import("jszip")).default;
                        const zip = new JSZip();
                        const picked = results.filter((_, i) => selected.has(i));
                        for (const f of picked) zip.file(f.name, f.blob);
                        const blob = await zip.generateAsync({ type: "blob" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `zapr-${Date.now()}.zip`;
                        a.click();
                        URL.revokeObjectURL(url);
                        toast.success("ZIP downloaded", {
                          id: tId,
                          description: `${picked.length} file${picked.length > 1 ? "s" : ""} packaged.`,
                        });
                      } catch (e: any) {
                        toast.error("ZIP failed", { id: tId, description: e?.message });
                      } finally {
                        setZipping(false);
                      }
                    }}
                    className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {zipping ? "Packaging…" : `Download ZIP (${selected.size})`}
                  </button>
                </div>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((r, i) => {
                const isSelected = selected.has(i);
                return (
                  <div
                    key={i}
                    className={`group relative rounded-xl border bg-card p-4 transition ${
                      isSelected ? "border-primary/60" : "border-border opacity-60"
                    }`}
                  >
                    {results.length > 1 && (
                      <button
                        onClick={() => {
                          const next = new Set(selected);
                          if (isSelected) next.delete(i);
                          else next.add(i);
                          setSelected(next);
                        }}
                        aria-label={isSelected ? "Deselect" : "Select"}
                        className={`absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-md border text-xs font-bold transition ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-transparent"
                        }`}
                      >
                        ✓
                      </button>
                    )}
                    {r.blob.type.startsWith("image/") && (
                      <img src={r.url} alt={r.name} className="mb-3 aspect-video w-full rounded-lg object-cover bg-background" />
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-mono text-sm">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{(r.blob.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <div className="flex shrink-0 gap-1.5">
                        <button
                          onClick={() => setPreviewFile(r)}
                          className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary transition"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => downloadFile(r)}
                          className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:scale-105 transition-transform"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <SiteFooter />
      </div>

      <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
    </main>
  );
}
