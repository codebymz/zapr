# Zapr — Universal File Converter

Zapr is a fast, free, and private file converter. All conversions run 100% in-browser via CDN libraries. No backend required. Your files never leave your device.

## 🚀 Features

- **Privacy First:** Files are never uploaded to any cloud. Everything stays on your machine.
- **Premium UI:** Dark glassmorphism design with smooth micro-animations.
- **In-Browser Previews:** View PDF, images, text, spreadsheets and documents before downloading.
- **Batch Processing:** Convert multiple files and download them as a ZIP archive.
- **Wide Format Support:** Documents, Presentations, Spreadsheets, and Images.

## 🛠 Supported Conversions

### Documents & Text
- **PDF → DOCX** — Extract text from PDFs into editable Word documents
- **DOCX → PDF** — Convert Word documents into standard PDFs
- **PDF → Text** — Extract plain text from PDF files
- **Markdown → DOCX** — Render `.md` files into formatted Word documents
- **Text → PDF** — Convert plain text into paginated PDFs
- **HTML → PDF** — Render HTML files into PDFs

### OCR & Scans
- **Image → OCR Word** — Extract text from images into editable Word documents
- **PDF → OCR Word** — Run OCR on scanned PDFs and output editable Word documents

### Spreadsheets & Data
- **DOCX → Excel** — Extract tables and paragraphs into Excel workbooks
- **Excel → DOCX** — Convert Excel sheets into Word tables
- **PDF → Excel** — Extract text and tables from PDFs into Excel workbooks
- **Excel → CSV** — Flatten multiple sheets into plain CSV
- **CSV → Excel** — Package CSV data into `.xlsx` format

### Presentations
- **PDF → PPTX** — Convert PDF pages into a PowerPoint presentation (one slide per page)

### Images
- **Images → PDF** — Bundle multiple photos into a single PDF
- **PDF → Images** — Extract every page as a high-quality PNG
- **Word → Image** — Render Word documents into images
- **→ PNG / JPG / WEBP** — Re-encode any image into popular web formats

### PDF Tools
- **PDF Merge** — Combine multiple PDF files into one
- **PDF Split** — Split a PDF into individual pages or extract a specific range
- **PDF Compress** — Reduce PDF file size by compressing embedded images

## 💻 How to Run & Deploy

This is a 100% static site (HTML, CSS, JS). You can deploy it on any static hosting provider.

### Local Development
1. Clone or download this repository
2. Open `index.html` in any modern browser
3. Start converting!

> For best results (PDF.js workers), serve via a local server:
> ```bash
> npx serve .
> # or
> python -m http.server
> ```

### Deployment
You can host this project easily on:
- **Vercel** (Recommended):
  - **Option 1 (GitHub Integration):** Push to your GitHub repo, go to [vercel.com](https://vercel.com), click "Add New..." > "Project", import this repository, and click **Deploy**. It works out-of-the-box with zero configuration thanks to `vercel.json`.
  - **Option 2 (Vercel CLI):** Run `npx vercel` in the project directory and follow the prompts, then `npx vercel --prod` to deploy to production.
- **GitHub Pages**: Go to repository Settings > Pages, and select the `master` (or `main`) branch as the source.
- **Netlify**: Drag and drop the folder, or link your repository.

## 📦 Tech Stack

- [PDF.js](https://mozilla.github.io/pdf.js/) — PDF rendering
- [jsPDF](https://github.com/parallax/jsPDF) — PDF generation
- [pdf-lib](https://pdf-lib.js.org/) — PDF manipulation (merge, split)
- [html2canvas](https://html2canvas.hertzen.com/) — DOM to canvas rendering
- [Tesseract.js](https://tesseract.projectnaptha.com/) — Optical Character Recognition (OCR)
- [SheetJS](https://sheetjs.com/) — Excel/CSV parsing
- [docx](https://docx.js.org/) — Word generation
- [mammoth.js](https://github.com/mwilliamson/mammoth.js) — Word extraction
- [PptxGenJS](https://gitbrent.github.io/PptxGenJS/) — PowerPoint generation
- [JSZip](https://stuk.github.io/jszip/) — ZIP packaging

## 📝 License & Terms

Zapr is provided as a free tool. See the Terms and Privacy pages within the app for usage policies.
