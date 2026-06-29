# Zapr - Universal In-Browser File Converter

Zapr is a fast, free, and secure file converter that runs **100% locally in your browser**. Your files never leave your device, ensuring maximum privacy and zero upload wait times.

## 🚀 Features

- **Privacy First:** All conversions happen locally on your device. Zero server uploads.
- **Modern Premium UI:** Sleek, glassmorphism-inspired design with smooth micro-animations.
- **In-Browser Previews:** View the converted output (Images, Text, Spreadsheets, Slides, Documents) directly in your browser before downloading.
- **Batch Processing:** Convert and download multiple files as a single ZIP archive.
- **Wide Format Support:** Supports Documents, Presentations, Spreadsheets, and Images.

## 🛠 Supported Conversions

### Documents & Text
- **PDF → DOCX:** Extract text from PDFs into editable Word documents.
- **DOCX → PDF:** Convert Word documents into standard PDFs.
- **PDF → Text:** Extract plain text from PDF files.
- **Markdown → DOCX:** Render `.md` files into formatted Word documents.

### Spreadsheets & Data
- **DOCX → Excel:** Extract tables and paragraphs into Excel workbooks.
- **Excel → DOCX:** Convert Excel sheets into Word tables.
- **Excel → CSV:** Flatten multiple sheets into plain CSV files.
- **CSV → Excel:** Package CSV data into `.xlsx` format.

### Presentations
- **PDF → PPTX:** Convert PDF pages into a PowerPoint presentation, preserving exact layout and adding smooth fade transitions.

### Images
- **Images → PDF:** Bundle multiple photos into a single PDF document.
- **PDF → Images:** Extract every page of a PDF as a high-quality PNG.
- **Convert to PNG / JPG / WEBP:** Instantly re-encode any image file into popular web formats.

## 💻 Tech Stack

Zapr is built with vanilla **HTML, CSS, and JavaScript** and powered by the best open-source client-side libraries:

- [PDF.js](https://mozilla.github.io/pdf.js/) (PDF rendering)
- [jsPDF](https://github.com/parallax/jsPDF) (PDF generation)
- [SheetJS](https://sheetjs.com/) (Excel / CSV parsing)
- [docx](https://docx.js.org/) (Word generation)
- [mammoth.js](https://github.com/mwilliamson/mammoth.js) (Word extraction)
- [PptxGenJS](https://gitbrent.github.io/PptxGenJS/) (PowerPoint generation)
- [JSZip](https://stuk.github.io/jszip/) (ZIP packaging)

## 🏃‍♂️ How to Run

Since Zapr is completely client-side, you don't need a backend server to run it. 

1. Clone or download this repository.
2. Open `index.html` in any modern web browser.
3. Start converting!

*(Note: For the best experience and to avoid local file restrictions on certain APIs like Web Workers used by PDF.js, you can serve the directory using a simple local server like `npx serve`, `python -m http.server`, or the VS Code Live Server extension).*

## 📝 License & Terms

Zapr is provided as a free tool. Please see the Terms and Privacy pages within the app for more details on usage policies.
