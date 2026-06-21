import { useEffect, useState } from "react";
import { ConvertedFile, downloadFile } from "@/lib/converters";

interface Props {
  file: ConvertedFile | null;
  onClose: () => void;
}

export function PreviewModal({ file, onClose }: Props) {
  const [docxHtml, setDocxHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!file) return;
    const isDocx = file.name.toLowerCase().endsWith(".docx");
    if (!isDocx) {
      setDocxHtml(null);
      return;
    }
    setLoading(true);
    setDocxHtml(null);
    file.blob
      .arrayBuffer()
      .then(async (buf) => {
        const mammoth = await import("mammoth");
        const { value } = await mammoth.convertToHtml({ arrayBuffer: buf });
        setDocxHtml(value || "<p><em>(empty document)</em></p>");
      })
      .catch(() => setDocxHtml("<p><em>Preview unavailable.</em></p>"))
      .finally(() => setLoading(false));
  }, [file]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!file) return null;

  const isPdf = file.name.toLowerCase().endsWith(".pdf");
  const isImage = file.blob.type.startsWith("image/");
  const isDocx = file.name.toLowerCase().endsWith(".docx");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold">Preview</p>
            <p className="truncate font-mono text-xs text-muted-foreground">
              {file.name} · {(file.blob.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                downloadFile(file);
                onClose();
              }}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:scale-105 transition-transform"
            >
              Confirm & Download
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-background">
          {isPdf && (
            <iframe
              src={file.url}
              title={file.name}
              className="h-full w-full border-0"
            />
          )}
          {isImage && (
            <div className="flex h-full w-full items-center justify-center p-6">
              <img
                src={file.url}
                alt={file.name}
                className="max-h-full max-w-full rounded-lg object-contain"
              />
            </div>
          )}
          {isDocx && (
            <div className="mx-auto max-w-3xl p-8">
              {loading && (
                <p className="text-sm text-muted-foreground">Rendering preview…</p>
              )}
              {docxHtml && (
                <div
                  className="docx-preview prose prose-invert max-w-none rounded-lg bg-white p-8 text-black"
                  style={{ fontFamily: "Arial, sans-serif", lineHeight: 1.5 }}
                  dangerouslySetInnerHTML={{ __html: docxHtml }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
