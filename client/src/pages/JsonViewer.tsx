import { useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { flatten } from "../utils/flatten";
import { BigRow } from "../types/BigRow";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

export default function JsonViewer() {
  const [rows, setRows] = useState<BigRow[]>([]);
  const [cols, setCols] = useState<ColDef<BigRow>[]>([]);

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const json = JSON.parse(await file.text());
    const data = (Array.isArray(json) ? json : [json]).map(obj => flatten(obj));
    setRows(data);

    /** build column defs once we have the shape */
    setCols(
      Object.keys(data[0] ?? {}).map((field) => ({ field })) as ColDef<BigRow>[]
    );

    /* persist to Express */
    await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  return (
    <div style={{ padding: 16 }}>
      <input type="file" accept=".json" onChange={handle} />
      <div className="ag-theme-alpine" style={{ height: "80vh", marginTop: 16 }}>
        <AgGridReact<BigRow>
          rowData={rows}
          columnDefs={cols}
          pagination
          paginationAutoPageSize
        />
      </div>
    </div>
  );
}