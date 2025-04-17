import { Document, Page, pdfjs } from "react-pdf";
import { useParams, Link } from "react-router-dom";
import { useState, useCallback } from "react";
import workerSrc from "pdfjs-dist/build/pdf.worker.mjs?url";
import 'react-pdf/dist/Page/TextLayer.css';

// Use a known working version or let pdfjs handle the version itself
// Remove the version specification to use the version that comes with your installed package
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
export default function PdfViewer() {
  const { id } = useParams();
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  }, []);

  const onDocumentLoadError = useCallback((err: Error) => {
    console.error("Error loading PDF:", err);
    setError("Failed to load PDF document");
    setLoading(false);
  }, []);

  if (!id) return <>Missing ID</>;

  return (
    <div style={{ padding: 16 }}>
      <Link to="/records">← back</Link>
      
      {loading && <div>Loading PDF...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      
      <div style={{ marginTop: 20 }}>
        <Document 
          file={`/pdf/${id}.pdf`} 
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<div>Loading document...</div>}
        >
          {Array.from(new Array(numPages), (_, index) => (
            <Page 
              key={`page_${index + 1}`} 
              pageNumber={index + 1} 
              renderTextLayer
              renderAnnotationLayer
              width={Math.min(800, window.innerWidth - 50)}
            />
          ))}
        </Document>
      </div>
    </div>
  );
}