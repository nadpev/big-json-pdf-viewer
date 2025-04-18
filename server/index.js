import express from "express";
import cors from "cors";
import fs from "fs";
import { globSync } from "glob";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json({ limit: "200mb" }));

// Improved flatten function that handles nested objects better
const flattenObject = (obj, prefix = '') => {
  const flattened = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Skip null values
    if (value === null) continue;
    
    // Handle nested objects (but not arrays or null)
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Special handling for geolocation to make it readable
      if (key === 'Geolocation__c') {
        flattened[`${prefix}${key}`] = `${value.latitude}, ${value.longitude}`;
        continue;
      }
      
      // Recursively flatten nested objects
      const nested = flattenObject(value, `${prefix}${key}_`);
      Object.assign(flattened, nested);
    } else {
      // Add non-object properties directly
      flattened[`${prefix}${key}`] = value;
    }
  }
  
  return flattened;
};

const toRows = (data) => (Array.isArray(data) ? data : [data]).map(item => flattenObject(item));
const loadGenerated = () => {
  if (app.locals.generated) return app.locals.generated;       // cached
 
  const dir   = path.join(__dirname, "openai");                // ← put yours here
  const files = globSync(path.join(dir, "**/*.pdf.openai.json"));
  const out   = {};                                            // { "Some.pdf":{…flat…}, … }
 
  files.forEach(f => {
    const flat = flattenObject(JSON.parse(fs.readFileSync(f, "utf8")));
    const pdf  = path.basename(f).replace(/\.pdf\.openai\.json$/, "") + ".pdf";
    out[pdf]   = flat;
  });
  return (app.locals.generated = out);
 };
 
 app.get("/api/generated", (_, res) => {
  res.json(loadGenerated());
 });
app.post("/api/upload", (req, res) => {
  app.locals.currentJson = toRows(req.body);
  delete app.locals.records;
  res.sendStatus(204);
});

app.get("/api/records", (req, res) => {
  const { start = 0, limit = 100 } = req.query;

  if (!app.locals.records) {
    const files = globSync(path.join(__dirname, "data", "**/*.json"));
    const rows = [];
    files.forEach((f) => {
      const json = JSON.parse(fs.readFileSync(f));
      rows.push(...toRows(json));
    });
    if (app.locals.currentJson) rows.unshift(...app.locals.currentJson);
    app.locals.records = rows;
  }

  const s = +start,
    l = +limit;
  res.json({
    rows: app.locals.records.slice(s, s + l),
    total: app.locals.records.length
  });
});

// Serve PDF files
app.use("/pdf", express.static(path.join(__dirname, "pdf")));

// Serve static files for the frontend
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT ?? 5174;
app.listen(PORT, () => console.log(`API running http://localhost:${PORT}`));