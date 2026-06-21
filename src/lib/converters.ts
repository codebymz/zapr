import { jsPDF } from "jspdf";

export type ConversionType =
  | "images-to-pdf"
  | "pdf-to-images"
  | "image-to-jpg"
  | "image-to-png"
  | "image-to-webp"
  | "docx-to-pdf"
  | "pdf-to-docx"
  | "docx-to-xlsx"
  | "xlsx-to-docx"
  | "pdf-to-text"
  | "xlsx-to-csv"
  | "csv-to-xlsx"
  | "md-to-docx";

export function validateFile(file: File, accept: string): string | null {
  if (accept === "image/*") {
    if (!file.type.startsWith("image/")) return `"${file.name}" is not an image`;
    return null;
  }
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  if (accept === "application/pdf" && ext !== "pdf") return `"${file.name}" is not a PDF`;
  if (accept.includes("wordprocessingml") && ext !== "docx")
    return `"${file.name}" is not a DOCX`;
  if (accept.includes("spreadsheetml") && ext !== "xlsx" && ext !== "xls")
    return `"${file.name}" is not an Excel file`;
  if (accept === "text/csv" && ext !== "csv") return `"${file.name}" is not a CSV`;
  if (accept === "text/markdown" && ext !== "md" && ext !== "markdown")
    return `"${file.name}" is not a Markdown file`;
  return null;
}

export interface ConvertedFile {
  name: string;
  blob: Blob;
  url: string;
}

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });

export async function imagesToPdf(files: File[]): Promise<ConvertedFile> {
  const pdf = new jsPDF({ unit: "px", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < files.length; i++) {
    const img = await loadImage(files[i]);
    const ratio = Math.min(pageW / img.width, pageH / img.height);
    const w = img.width * ratio;
    const h = img.height * ratio;
    const x = (pageW - w) / 2;
    const y = (pageH - h) / 2;
    if (i > 0) pdf.addPage();
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext("2d")!.drawImage(img, 0, 0);
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", x, y, w, h);
  }

  const blob = pdf.output("blob");
  return { name: "converted.pdf", blob, url: URL.createObjectURL(blob) };
}

export async function pdfToImages(file: File): Promise<ConvertedFile[]> {
  const pdfjs = await import("pdfjs-dist");
  // @ts-ignore
  const workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  const results: ConvertedFile[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    const blob: Blob = await new Promise((r) =>
      canvas.toBlob((b) => r(b!), "image/png")
    );
    results.push({
      name: `page-${i}.png`,
      blob,
      url: URL.createObjectURL(blob),
    });
  }
  return results;
}

export async function convertImageFormat(
  file: File,
  format: "jpg" | "png" | "webp"
): Promise<ConvertedFile> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  if (format === "jpg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);
  const mime = format === "jpg" ? "image/jpeg" : `image/${format}`;
  const blob: Blob = await new Promise((r) =>
    canvas.toBlob((b) => r(b!), mime, 0.95)
  );
  const baseName = file.name.replace(/\.[^.]+$/, "");
  return {
    name: `${baseName}.${format}`,
    blob,
    url: URL.createObjectURL(blob),
  };
}

export function downloadFile(file: ConvertedFile) {
  const a = document.createElement("a");
  a.href = file.url;
  a.download = file.name;
  a.click();
}

export type ProgressFn = (pct: number, label?: string) => void;

export async function docxToPdf(file: File, onProgress?: ProgressFn): Promise<ConvertedFile> {
  onProgress?.(5, "Reading DOCX");
  const mammoth = await import("mammoth");
  const buf = await file.arrayBuffer();
  onProgress?.(25, "Parsing document");
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer: buf });

  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;left:-10000px;top:0;width:794px;padding:48px;background:#fff;color:#000;font-family:Arial,sans-serif;font-size:12pt;line-height:1.5;";
  container.innerHTML = html || "<p><em>(empty document)</em></p>";
  document.body.appendChild(container);

  try {
    onProgress?.(55, "Rendering PDF");
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    await pdf.html(container, {
      callback: () => {},
      autoPaging: "text",
      margin: [40, 40, 40, 40],
      width: 515,
      windowWidth: 794,
    });
    onProgress?.(95, "Finalizing");
    const blob = pdf.output("blob");
    const name = file.name.replace(/\.docx$/i, "") + ".pdf";
    onProgress?.(100, "Done");
    return { name, blob, url: URL.createObjectURL(blob) };
  } finally {
    container.remove();
  }
}

export async function pdfToDocx(file: File, onProgress?: ProgressFn): Promise<ConvertedFile> {
  onProgress?.(5, "Loading PDF");
  const pdfjs = await import("pdfjs-dist");
  // @ts-ignore
  const workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  const { Document, Packer, Paragraph, TextRun, PageBreak } = await import("docx");

  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  const paragraphs: any[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    onProgress?.(10 + Math.round((i / pdf.numPages) * 75), `Extracting page ${i}/${pdf.numPages}`);
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const lines = new Map<number, string[]>();
    for (const item of content.items as any[]) {
      const y = Math.round(item.transform[5]);
      if (!lines.has(y)) lines.set(y, []);
      lines.get(y)!.push(item.str);
    }
    const sorted = [...lines.entries()].sort((a, b) => b[0] - a[0]);
    for (const [, parts] of sorted) {
      const text = parts.join(" ").trim();
      paragraphs.push(new Paragraph({ children: [new TextRun(text || " ")] }));
    }
    if (i < pdf.numPages) {
      paragraphs.push(new Paragraph({ children: [new PageBreak()] }));
    }
  }

  onProgress?.(90, "Building DOCX");
  const doc = new Document({ sections: [{ children: paragraphs }] });
  const blob = await Packer.toBlob(doc);
  const name = file.name.replace(/\.pdf$/i, "") + ".docx";
  onProgress?.(100, "Done");
  return { name, blob, url: URL.createObjectURL(blob) };
}

export interface ConversionSettings {
  includeContent?: boolean;
  maxHeadingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

function validateHeadingLevel(level: unknown): asserts level is 1 | 2 | 3 | 4 | 5 | 6 {
  if (typeof level !== "number" || !Number.isInteger(level) || level < 1 || level > 6) {
    throw new Error(
      `Invalid heading level "${level}". Choose a value between H1 and H6 (1–6).`
    );
  }
}

export async function docxToXlsx(
  file: File,
  onProgress?: ProgressFn,
  settings: ConversionSettings = {},
): Promise<ConvertedFile> {
  const includeContent = settings.includeContent ?? true;
  const maxH = settings.maxHeadingLevel ?? 3;
  validateHeadingLevel(maxH);
  onProgress?.(10, "Reading DOCX");
  const mammoth = await import("mammoth");
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer: buf });

  onProgress?.(40, "Parsing content");
  const parser = new DOMParser();
  const doc = parser.parseFromString(html || "<p></p>", "text/html");
  const wb = XLSX.utils.book_new();

  const tables = Array.from(doc.querySelectorAll("table"));
  if (tables.length > 0) {
    tables.forEach((table, idx) => {
      const rows: string[][] = Array.from(table.querySelectorAll("tr")).map((tr) =>
        Array.from(tr.querySelectorAll("th,td")).map((c) => (c.textContent || "").trim()),
      );
      const ws = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, `Table ${idx + 1}`);
    });
  }

  if (includeContent || tables.length === 0) {
    const headingSel = Array.from({ length: maxH }, (_, i) => `h${i + 1}`).join(",");
    const selector = `p,li,${headingSel}`;
    const paragraphs = Array.from(doc.querySelectorAll(selector))
      .map((el) => (el.textContent || "").trim())
      .filter(Boolean);
    const ws = XLSX.utils.aoa_to_sheet(
      paragraphs.length ? paragraphs.map((p) => [p]) : [["(empty document)"]],
    );
    XLSX.utils.book_append_sheet(wb, ws, "Content");
  }

  onProgress?.(85, "Building XLSX");
  const arrayBuffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  const blob = new Blob([arrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const name = file.name.replace(/\.docx$/i, "") + ".xlsx";
  onProgress?.(100, "Done");
  return { name, blob, url: URL.createObjectURL(blob) };
}

export async function xlsxToDocx(
  file: File,
  onProgress?: ProgressFn,
  settings: ConversionSettings = {},
): Promise<ConvertedFile> {
  const maxH = settings.maxHeadingLevel ?? 1;
  validateHeadingLevel(maxH);
  onProgress?.(10, "Reading workbook");
  const XLSX = await import("xlsx");
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    Table,
    TableRow,
    TableCell,
    WidthType,
    PageBreak,
  } = await import("docx");

  const headingMap: Record<number, any> = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
    4: HeadingLevel.HEADING_4,
    5: HeadingLevel.HEADING_5,
    6: HeadingLevel.HEADING_6,
  };
  const sheetHeading = headingMap[maxH] ?? HeadingLevel.HEADING_1;

  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const children: any[] = [];

  wb.SheetNames.forEach((sheetName, sIdx) => {
    onProgress?.(
      20 + Math.round(((sIdx + 1) / wb.SheetNames.length) * 60),
      `Sheet: ${sheetName}`,
    );
    if (sIdx > 0) children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(
      new Paragraph({ heading: sheetHeading, children: [new TextRun(sheetName)] }),
    );
    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: "" });
    if (!rows.length) {
      children.push(new Paragraph({ children: [new TextRun("(empty sheet)")] }));
      return;
    }
    const colCount = Math.max(...rows.map((r) => r.length));
    const table = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: rows.map(
        (r) =>
          new TableRow({
            children: Array.from({ length: colCount }).map(
              (_, ci) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun(String(r[ci] ?? ""))],
                    }),
                  ],
                }),
            ),
          }),
      ),
    });
    children.push(table);
  });

  onProgress?.(90, "Building DOCX");
  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  const name = file.name.replace(/\.(xlsx|xls)$/i, "") + ".docx";
  onProgress?.(100, "Done");
  return { name, blob, url: URL.createObjectURL(blob) };
}

export async function pdfToText(file: File, onProgress?: ProgressFn): Promise<ConvertedFile> {
  onProgress?.(5, "Loading PDF");
  const pdfjs = await import("pdfjs-dist");
  // @ts-ignore
  const workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  const out: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    onProgress?.(10 + Math.round((i / pdf.numPages) * 80), `Extracting page ${i}/${pdf.numPages}`);
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const lines = new Map<number, string[]>();
    for (const item of content.items as any[]) {
      const y = Math.round(item.transform[5]);
      if (!lines.has(y)) lines.set(y, []);
      lines.get(y)!.push(item.str);
    }
    const sorted = [...lines.entries()].sort((a, b) => b[0] - a[0]);
    for (const [, parts] of sorted) out.push(parts.join(" ").trim());
    if (i < pdf.numPages) out.push("", `--- Page ${i + 1} ---`, "");
  }

  const blob = new Blob([out.join("\n")], { type: "text/plain;charset=utf-8" });
  const name = file.name.replace(/\.pdf$/i, "") + ".txt";
  onProgress?.(100, "Done");
  return { name, blob, url: URL.createObjectURL(blob) };
}

export async function xlsxToCsv(file: File, onProgress?: ProgressFn): Promise<ConvertedFile> {
  onProgress?.(15, "Reading workbook");
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  onProgress?.(60, "Converting to CSV");
  const parts: string[] = [];
  wb.SheetNames.forEach((name, i) => {
    if (wb.SheetNames.length > 1) parts.push(`# ${name}`);
    parts.push(XLSX.utils.sheet_to_csv(wb.Sheets[name]));
    if (i < wb.SheetNames.length - 1) parts.push("");
  });
  const blob = new Blob([parts.join("\n")], { type: "text/csv;charset=utf-8" });
  const name = file.name.replace(/\.(xlsx|xls)$/i, "") + ".csv";
  onProgress?.(100, "Done");
  return { name, blob, url: URL.createObjectURL(blob) };
}

export async function csvToXlsx(file: File, onProgress?: ProgressFn): Promise<ConvertedFile> {
  onProgress?.(15, "Reading CSV");
  const XLSX = await import("xlsx");
  const text = await file.text();
  onProgress?.(55, "Building workbook");
  const wb = XLSX.read(text, { type: "string" });
  const arrayBuffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  const blob = new Blob([arrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const name = file.name.replace(/\.csv$/i, "") + ".xlsx";
  onProgress?.(100, "Done");
  return { name, blob, url: URL.createObjectURL(blob) };
}

export async function mdToDocx(file: File, onProgress?: ProgressFn): Promise<ConvertedFile> {
  onProgress?.(10, "Reading Markdown");
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");
  const text = await file.text();
  onProgress?.(45, "Parsing");

  const headingMap: Record<number, any> = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
    4: HeadingLevel.HEADING_4,
    5: HeadingLevel.HEADING_5,
    6: HeadingLevel.HEADING_6,
  };

  const renderInline = (s: string): any[] => {
    const runs: any[] = [];
    const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(s))) {
      if (m.index > last) runs.push(new TextRun(s.slice(last, m.index)));
      if (m[2] !== undefined) runs.push(new TextRun({ text: m[2], bold: true }));
      else if (m[3] !== undefined) runs.push(new TextRun({ text: m[3], italics: true }));
      else if (m[4] !== undefined) runs.push(new TextRun({ text: m[4], font: "Courier New" }));
      last = m.index + m[0].length;
    }
    if (last < s.length) runs.push(new TextRun(s.slice(last)));
    return runs.length ? runs : [new TextRun(s)];
  };

  const children: any[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/\s+$/, "");
    if (!line.trim()) {
      children.push(new Paragraph({ children: [new TextRun("")] }));
      continue;
    }
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      children.push(
        new Paragraph({ heading: headingMap[h[1].length], children: renderInline(h[2]) }),
      );
      continue;
    }
    const li = /^\s*[-*+]\s+(.*)$/.exec(line);
    if (li) {
      children.push(new Paragraph({ bullet: { level: 0 }, children: renderInline(li[1]) }));
      continue;
    }
    const ol = /^\s*\d+\.\s+(.*)$/.exec(line);
    if (ol) {
      children.push(new Paragraph({ children: renderInline(ol[1]) }));
      continue;
    }
    children.push(new Paragraph({ children: renderInline(line) }));
  }

  onProgress?.(85, "Building DOCX");
  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  const name = file.name.replace(/\.(md|markdown)$/i, "") + ".docx";
  onProgress?.(100, "Done");
  return { name, blob, url: URL.createObjectURL(blob) };
}
