declare module 'pdfkit/js/pdfkit.standalone.js' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const PDFDocument: any; // fallback: no type safety
  export default PDFDocument;
}
