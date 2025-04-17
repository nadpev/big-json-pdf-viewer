import { Link, Route, Routes } from "react-router-dom";
import JsonViewer from "./pages/JsonViewer";
import RecordsTable from "./pages/RecordsTable";
import PdfViewer from "./pages/PdfViewer";

export default function App() {
  return (
    <>
      <nav style={{ margin: 12 }}>
        <Link to="/">Upload JSON</Link>{" │ "}
        <Link to="/records">Records</Link>
      </nav>

      <Routes>
        <Route path="/" element={<JsonViewer />} />
        <Route path="/records" element={<RecordsTable />} />
        <Route path="/pdf/:id" element={<PdfViewer />} />
      </Routes>
    </>
  );
}