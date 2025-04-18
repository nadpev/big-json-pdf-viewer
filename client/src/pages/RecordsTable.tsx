import { useState, useEffect, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  RowClickedEvent,
  CellClassParams,
  RowClassParams,
  IRowNode
} from "ag-grid-community";
import { Document, Page, pdfjs } from "react-pdf";
import workerSrc from "pdfjs-dist/build/pdf.worker.mjs?url";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "../index.css";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

type FlatRecord = Record<string, unknown>;
type GeneratedMap = Record<string, FlatRecord>;

const flattenObject = (obj: unknown, prefix = ""): FlatRecord => {
  const flat: FlatRecord = {};
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    for (const [k, v] of Object.entries(obj)) {
      if (v == null) continue;
      if (typeof v === "object" && !Array.isArray(v)) {
        if (k === "Geolocation__c") {
          const lat = (v as { latitude: number }).latitude;
          const lng = (v as { longitude: number }).longitude;
          flat[`${prefix}${k}`] = `${lat}, ${lng}`;
        } else {
          Object.assign(flat, flattenObject(v, `${prefix}${k}_`));
        }
      } else {
        flat[`${prefix}${k}`] = v;
      }
    }
  }
  return flat;
};

export default function RecordsTable() {
  const [rowData, setRowData] = useState<FlatRecord[]>([]);
  const [generated, setGenerated] = useState<GeneratedMap>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [gridApi, setGridApi] = useState<GridApi<FlatRecord> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      const [baseRes, genRes] = await Promise.all([
        fetch("/api/records"),
        fetch("/api/generated")
      ]);
      const baseJson = await baseRes.json();
      const genJson: GeneratedMap = await genRes.json();
      setRowData(baseJson.rows.map((r: unknown) => flattenObject(r)));
      setGenerated(genJson);
      setLoading(false);
    })();
  }, []);

  const baseCols: ColDef[] = useMemo(
    () => [
      { field: "PdfName", headerName: "PDF", flex: 1 },
      { field: "Email_Subject", headerName: "Email Subject", flex: 2 },
      { field: "Email_FromAddress", headerName: "From", flex: 1 },
      { field: "Email_ToAddress", headerName: "To", flex: 1 },
      { field: "Case_CaseNumber", headerName: "Case #", flex: 1 },
      { field: "Case_Subject", headerName: "Case Subject", flex: 2 },
      { field: "Account_Name", headerName: "Account", flex: 1 },
      { field: "Contact_FirstName", headerName: "First Name", flex: 1 },
      { field: "Contact_LastName", headerName: "Last Name", flex: 1 },
      { field: "Address_Full_Address__c", headerName: "Address", flex: 2 }
    ],
    []
  );
  console.log(generated)
  const columnDefs = useMemo<ColDef[]>(
    () =>
      baseCols.map(col => ({
        ...col,
        cellClass: (p: CellClassParams<FlatRecord>) =>
          generated[p.data?.PdfName as string] &&
          p.value !== generated[p.data?.PdfName as string][col.field as string]
            ? "diff-cell"
            : ""
      })),
    [generated, baseCols]
  );

  const defaultColDef: ColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true
    }),
    []
  );

  const onGridReady = useCallback(
    (p: GridReadyEvent<FlatRecord>) => setGridApi(p.api),
    []
  );

  const onRowClicked = useCallback((e: RowClickedEvent<FlatRecord>) => {
    const id = e.data?.PdfName as string | undefined;
    if (id) setSelectedId(id);
  }, []);

  const getRowClass = useCallback(
    (p: RowClassParams<FlatRecord>) =>
      p.data?.PdfName === selectedId ? "selected-row" : "",
    [selectedId]
  );

  useEffect(() => {
    if (gridApi && selectedId) {
      gridApi.forEachNode((n: IRowNode<FlatRecord>) =>
        n.setSelected((n.data as FlatRecord).PdfName === selectedId)
      );
    }
  }, [gridApi, selectedId]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div className="ag-theme-alpine" style={{ flexBasis: "55%", minWidth: 400 }}>
        {loading ? (
          <div style={{ padding: 20 }}>Loading…</div>
        ) : (
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            onGridReady={onGridReady}
            onRowClicked={onRowClicked}
            rowSelection="single"
            pagination
            paginationPageSize={10}
            getRowClass={getRowClass}
          />
        )}
      </div>
      <div
        style={{
          flexBasis: "45%",
          borderLeft: "1px solid #ddd",
          padding: 16,
          overflow: "auto"
        }}
      >
        {selectedId ? (
          <>
            <h3>{selectedId}</h3>
            <Document
              file={`/pdf/${selectedId}`}
              onLoadSuccess={info => setNumPages(info.numPages)}
              loading={<p>Loading PDF…</p>}
            >
              {Array.from({ length: numPages }, (_, i) => (
                <Page key={i} pageNumber={i + 1} width={400} />
              ))}
            </Document>
          </>
        ) : (
          <p>Select a row to view its PDF</p>
        )}
      </div>
    </div>
  );
}