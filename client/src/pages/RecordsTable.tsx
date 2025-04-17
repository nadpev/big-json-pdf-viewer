import { useMemo, useState, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  IDatasource,
  IGetRowsParams,
  RowClickedEvent
} from "ag-grid-community";

import { Document, Page, pdfjs } from "react-pdf";
import { BigRow } from "../types/BigRow";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import workerSrc from "pdfjs-dist/build/pdf.worker.mjs?url";
import 'react-pdf/dist/Page/TextLayer.css';
// PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
export default function RecordsTable() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);

  /* ---------------- columns ---------------- */
  const columnDefs: ColDef<BigRow>[] = useMemo(
    () => [
      { field: "Email_Subject", flex: 1 },
      { field: "ContentVersionId", width: 160 },
      { field: "Case_CaseNumber", width: 120 },
    ],
    []
  );

  /* ---------------- datasource ------------- */
  const datasource: IDatasource = {
    getRows: async ({
      startRow,
      endRow,
      successCallback,
      failCallback,
    }: IGetRowsParams) => {
      try {
        const res = await fetch(
          `/api/records?start=${startRow}&limit=${endRow - startRow}`
        );
        const data: { rows: BigRow[]; total: number } = await res.json();
        successCallback(data.rows, data.total);
      } catch (error) {
        console.error(error);
        failCallback?.();
      }
    },
  };

  /* ------------- row click handler --------- */
  const onRowClicked = useCallback((r: RowClickedEvent<BigRow>) => {
    const id = r.data?.ContentVersionId;
    if (id) {
      setSelectedId(id);
      setNumPages(0);            // reset page counter so viewer refreshes
    }
  }, []);

  /* ---------------- render ----------------- */
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* LEFT — Grid */}
      <div
        className="ag-theme-alpine"
        style={{ flexBasis: "55%", minWidth: 400 }}
      >
        <AgGridReact<BigRow>
          columnDefs={columnDefs}
          rowModelType="infinite"
          datasource={datasource}
          onRowClicked={onRowClicked}
          rowSelection="single"
        />
      </div>

      {/* RIGHT — PDF viewer */}
      <div
        style={{
          flexBasis: "45%",
          borderLeft: "1px solid #ddd",
          padding: 8,
          overflow: "auto",
        }}
      >
     {selectedId ? (
  <Document
    file={`/pdf/${selectedId}.pdf`}
    onLoadSuccess={(info) => {
      console.log("PDF loaded successfully:", info);
      setNumPages(info.numPages);
    }}
    onLoadError={(error) => {
      console.error("PDF load error:", error);
      // Optionally show a user-friendly error message
    }}
    loading={<p>Loading PDF...</p>}
  >
    {Array.from({ length: numPages }, (_, i) => (
      <Page key={i} pageNumber={i + 1} width={400} />
    ))}
  </Document>
) : (
  <p>Select a row to preview its PDF →</p>
)}
      </div>
    </div>
  );
}