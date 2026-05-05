/**
 * Module 20: Shareable Results Engine
 *
 * Encode / decode module outputs to shareable URLs.
 * Generate printable HTML reports from any module's result.
 * Export data as CSV or JSON.
 *
 * All encoding is client-side (btoa/atob) — no server required.
 * Works via file:// and any hosted URL.
 */

function _r(n) { return Math.round(n * 100) / 100; }

// ─── Encode / Decode ─────────────────────────────────────────────────────────

/**
 * Encode a module state object to a URL-safe base64 string.
 *
 * @param {string} moduleId  – e.g. "loanEngine"
 * @param {object} stateObj  – any serialisable result or input object
 * @returns {string} URL-safe encoded string
 */
function encodeState(moduleId, stateObj) {
  if (!moduleId || typeof moduleId !== "string") throw new Error("moduleId must be a non-empty string.");
  const payload = JSON.stringify({ moduleId, data: stateObj, v: 1, ts: Date.now() });
  // btoa with unicode safety
  const encoded = btoa(encodeURIComponent(payload).replace(/%([0-9A-F]{2})/g,
    (_, p1) => String.fromCharCode(parseInt(p1, 16))));
  // Make URL-safe: replace + / =
  return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Decode a URL-safe base64 string back to { moduleId, data, ts }.
 *
 * @param {string} encoded
 * @returns {{ moduleId: string, data: object, ts: number }}
 */
function decodeState(encoded) {
  if (!encoded || typeof encoded !== "string") throw new Error("encoded must be a non-empty string.");
  // Restore standard base64
  const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - b64.length % 4) % 4);
  const payload = decodeURIComponent(atob(padded).split("").map(
    c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""));
  return JSON.parse(payload);
}

/**
 * Build a complete shareable URL with the encoded state in the hash.
 *
 * @param {string} moduleId
 * @param {object} stateObj
 * @param {object} [options]
 * @param {string}  [options.baseUrl]  – hosted URL (defaults to a placeholder)
 * @returns {{ url: string, encoded: string, moduleId: string }}
 */
function buildShareURL(moduleId, stateObj, { baseUrl = "https://smallbiz.app/calculators" } = {}) {
  const encoded = encodeState(moduleId, stateObj);
  const url     = `${baseUrl}/${moduleId}#state=${encoded}`;
  return { url, encoded, moduleId, characterCount: url.length };
}

// ─── Print / Export ──────────────────────────────────────────────────────────

/**
 * Generate a self-contained printable HTML string.
 *
 * @param {object} p
 * @param {string} p.moduleId
 * @param {string} p.title         – Report title
 * @param {string} [p.businessName]
 * @param {string} [p.date]
 * @param {Array}  p.sections      – [{ heading, rows: [{label, value, note?}] }]
 * @param {string} [p.verdict]
 * @param {string} [p.verdictColor] – "green" | "amber" | "red"
 * @param {string} [p.disclaimer]
 * @returns {string} complete HTML document
 */
function generatePrintHTML({ moduleId, title, businessName = "Business",
    date, sections = [], verdict = null, verdictColor = "green", disclaimer = "" }) {
  const reportDate = date || new Date().toLocaleDateString("en-US",
    { day: "2-digit", month: "long", year: "numeric" });

  const verdictColors = { green: "#16a34a", amber: "#d97706", red: "#dc2626", blue: "#2563eb" };
  const vc = verdictColors[verdictColor] || "#1e293b";

  const sectionsHTML = sections.map(s => `
    <div class="section">
      <h3>${s.heading}</h3>
      <table>
        <tbody>
          ${(s.rows || []).map(r => `
          <tr>
            <td class="label">${r.label}</td>
            <td class="value">${r.value}</td>
            ${r.note ? `<td class="note">${r.note}</td>` : "<td></td>"}
          </tr>`).join("")}
        </tbody>
      </table>
    </div>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${title} — ${businessName}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Georgia, serif; color: #1e293b; padding: 40px; font-size: 13px; max-width: 800px; margin: 0 auto; }
  .report-header { border-bottom: 3px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
  .report-title  { font-size: 22px; font-weight: 700; color: #0f172a; }
  .report-meta   { font-size: 11px; color: #64748b; margin-top: 6px; }
  .verdict-box   { border: 2px solid ${vc}; border-radius: 8px; padding: 14px; margin-bottom: 24px; background: #f8fafc; }
  .verdict-text  { font-size: 16px; font-weight: 800; color: ${vc}; }
  .section       { margin-bottom: 24px; page-break-inside: avoid; }
  h3             { font-size: 11px; text-transform: uppercase; letter-spacing: .1em; color: #64748b; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
  table          { width: 100%; border-collapse: collapse; }
  td             { padding: 6px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
  .label         { color: #64748b; width: 45%; }
  .value         { font-weight: 600; color: #0f172a; }
  .note          { color: #94a3b8; font-size: 11px; }
  .disclaimer    { font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 24px; }
  .footer        { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 24px; }
  @media print   { body { padding: 20px; } }
</style>
</head>
<body>
<div class="report-header">
  <div class="report-title">${title}</div>
  <div class="report-meta">${businessName} &nbsp;·&nbsp; ${reportDate} &nbsp;·&nbsp; Module: ${moduleId}</div>
</div>
${verdict ? `<div class="verdict-box"><div class="verdict-text">${verdict}</div></div>` : ""}
${sectionsHTML}
${disclaimer ? `<div class="disclaimer">${disclaimer}</div>` : ""}
<div class="footer">Generated by SmallBiz Financial Platform &nbsp;·&nbsp; ${reportDate}</div>
</body>
</html>`;
}

/**
 * Export data as a CSV string.
 *
 * @param {string[]} headers  – column names
 * @param {Array[]}  rows     – array of arrays (values must be primitives)
 * @returns {string} CSV content
 */
function exportCSV(headers, rows) {
  if (!Array.isArray(headers) || headers.length === 0) throw new Error("headers must be a non-empty array.");
  if (!Array.isArray(rows)) throw new Error("rows must be an array.");

  const escape = v => {
    const s = String(v == null ? "" : v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const lines = [
    headers.map(escape).join(","),
    ...rows.map(row => row.map(escape).join(",")),
  ];
  return lines.join("\r\n");
}

/**
 * Export any object as a formatted JSON string.
 *
 * @param {*}      data
 * @param {object} [options]
 * @param {number}  [options.indent=2]
 * @param {string}  [options.filename]  – hint for download (not enforced here)
 * @returns {{ json: string, size: string, filename: string }}
 */
function exportJSON(data, { indent = 2, filename = "export.json" } = {}) {
  const json = JSON.stringify(data, null, indent);
  const bytes = new TextEncoder().encode(json).length;
  const size  = bytes < 1024 ? `${bytes} B` : `${_r(bytes / 1024)} KB`;
  return { json, size, filename, characterCount: json.length };
}

/**
 * Build a data URI that triggers a file download (browser only).
 * Use: window.location.href = buildDownloadURI(csv, "text/csv", "export.csv").uri
 *
 * @param {string} content
 * @param {string} mimeType  – e.g. "text/csv" or "application/json"
 * @param {string} filename
 * @returns {{ uri: string, filename: string }}
 */
function buildDownloadURI(content, mimeType, filename) {
  const uri = `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`;
  return { uri, filename };
}

module.exports = {
  encodeState, decodeState, buildShareURL,
  generatePrintHTML, exportCSV, exportJSON, buildDownloadURI,
};
