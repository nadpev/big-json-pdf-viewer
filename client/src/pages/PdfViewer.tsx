import { Document, Page, pdfjs } from "react-pdf";
import { useParams, Link } from "react-router-dom";
import { useState } from "react";
pdfjs.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function PdfViewer() {
  const { id } = useParams();
  const [pages, setPages] = useState(0);
  if (!id) return <>missing id</>;

  return (
    <div style={{ padding: 16 }}>
      <Link to="/records">← back</Link>
      <Document file={`/pdf/${id}.pdf`} onLoadSuccess={info => setPages(info.numPages)}>
        {Array.from({ length: pages }, (_, i) => (
          <Page key={i} pageNumber={i + 1} />
        ))}
      </Document>
    </div>
  );
}