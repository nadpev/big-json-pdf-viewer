import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  IDatasource,
  IGetRowsParams,
} from "ag-grid-community";
import { useNavigate } from "react-router-dom";
import { BigRow } from "../types/BigRow";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

export default function RecordsTable() {
  const nav = useNavigate();

  // -------- 1. columns are typed -------------
  const columnDefs: ColDef<BigRow>[] = useMemo(
    () => [
      { field: "Email_Subject" },
      { field: "ContentVersionId" },
      { field: "Case_CaseNumber" },
    ],
    []
  );

  // -------- 2. datasource is fully typed ----
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
        console.error(error)
        failCallback?.();
      }
    },
  };

  return (
    <div className="ag-theme-alpine" style={{ height: "90vh" }}>
      <AgGridReact<BigRow>
        columnDefs={columnDefs}
        rowModelType="infinite"
        datasource={datasource}
        onRowClicked={(r) => {
            const id = r.data?.ContentVersionId;
            if (id) nav(`/pdf/${id}`)}}
      />
    </div>
  );
}