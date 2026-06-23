declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    filename?: string
    image?: { type?: string; quality?: number }
    html2canvas?: Record<string, unknown>
    jsPDF?: Record<string, unknown>
    pagebreak?: Record<string, unknown>
  }
  interface Html2PdfWorker {
    set(options: Html2PdfOptions): Html2PdfWorker
    from(element: Element): Html2PdfWorker
    save(): Promise<void>
    outputPdf(type: string): Promise<Blob>
  }
  function html2pdf(): Html2PdfWorker
  export default html2pdf
}
