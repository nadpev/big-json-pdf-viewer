import {Route, Routes } from "react-router-dom";
import RecordsTable from "./pages/RecordsTable";

export default function App() {
  return (
      <Routes>
        <Route path="/" element={<RecordsTable />} />
      </Routes>
  );
}