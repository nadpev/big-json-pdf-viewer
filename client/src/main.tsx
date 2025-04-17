import { ModuleRegistry } from "ag-grid-community";
import {
  ClientSideRowModelModule,
  InfiniteRowModelModule,
} from "ag-grid-community"; 
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  InfiniteRowModelModule,
]); 
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);