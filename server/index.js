import express from "express";
import cors from "cors";
import fs from "fs";
import {globSync} from "glob";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json({limit: "200mb"}));   // accept 20k‑row JSON

// ---------- upload one big JSON ----------
app.post("/api/upload", (req, res) => {
  app.locals.currentJson = req.body;
  res.sendStatus(204);
});

// ---------- aggregate columns from ALL JSON files ----------
app.get("/api/records", (req, res) => {
  const {start = 0, limit = 100} = req.query;
  if (!app.locals.records) {                       // first call → build cache
    const files = globSync("server/data/**/*.json");
    const pick = o => ({
      Email_Id: o.Email?.Id,
      Email_Subject: o.Email?.Subject,
      Email_Body: o.Email?.Body,
      Email_CreatedDate: o.Email?.CreatedDate,
      Email_From: o.Email?.From,
      ContentVersionId: o.ContentVersionId,
      ContentDocumentId: o.ContentDocumentId,
      Case_Id: o.Case?.Id,
      Case_AccountId: o.Case?.AccountId,
      Case_ContactId: o.Case?.ContactId,
      Case_CaseNumber: o.Case?.CaseNumber,
      Case_ContactEmail: o.Case?.ContactEmail,
      Case_Origin: o.Case?.Origin,
      Case_Subject: o.Case?.Subject,
      Case_Description: o.Case?.Description,
      Case_LastModifiedDate: o.Case?.LastModifiedDate,
      Case_IsClosed: o.Case?.IsClosed,
      Case_Order_Number__c: o.Case?.Order_Number__c,
      Case_SourceId: o.Case?.SourceId,
      Case_Receiving_Customer__c: o.Case?.Receiving_Customer__c,
    });

    const rows = [];
    files.forEach(f => {
      const obj = JSON.parse(fs.readFileSync(f));
      rows.push(...(Array.isArray(obj) ? obj : [obj]).map(pick));
    });
    app.locals.records = rows;
  }

  const s = +start, l = +limit;
  res.json({
    rows: app.locals.records.slice(s, s + l),
    total: app.locals.records.length,
  });
});

// ---------- static pdf delivery ----------
app.use("/pdf", express.static(path.resolve("server/pdf")));

const PORT = process.env.PORT ?? 5174;
app.listen(PORT, () => console.log("API running http://localhost:"+PORT));