const articleId = new URLSearchParams(window.location.search).get('id') || 'new';

let articlesRegistry = JSON.parse(sessionStorage.getItem("articlesRegistry") || "[0]");
let rawSitemapXml = sessionStorage.getItem("rawSitemapXml") || `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;

let currentMeta = null;
let currentBlocks = [];
let previewLang = "it";
let isPreviewActive = false;

async function initEditor() {
  if (articleId === 'new') {
    const existingIds = articlesRegistry.slice(1).map(a => parseInt(a.id, 10)).filter(n => !isNaN(n));
    const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;

    currentMeta = {
      id: String(nextId),
      class: "a1",
      date: new Date().toISOString().split("T")[0],
      "name-it": "",
      "name-en": "",
      "desc-it": "",
      "desc-en": "",
      search: []
    };
    currentBlocks = [{ type: "text", newline: true, "content-it": "", "content-en": "" }];
    setupEditorUI();
  } else if (articleId === 'uploaded') {
    const uploadedBlocks = sessionStorage.getItem("uploaded_blocks");
    currentBlocks = uploadedBlocks ? JSON.parse(uploadedBlocks) : [{ type: "text", newline: true, "content-it": "", "content-en": "" }];
    
    const existingIds = articlesRegistry.slice(1).map(a => parseInt(a.id, 10)).filter(n => !isNaN(n));
    const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;

    currentMeta = {
      id: String(nextId),
      class: "a1",
      date: new Date().toISOString().split("T")[0],
      "name-it": "Articolo Caricato",
      "name-en": "Uploaded Article",
      "desc-it": "",
      "desc-en": "",
      search: []
    };
    setupEditorUI();
  } else {
    // Caricamento articolo esistente tramite ID parametro URL
    const found = articlesRegistry.slice(1).find(a => String(a.id) === String(articleId));
    if (found) {
      currentMeta = JSON.parse(JSON.stringify(found));
    } else {
      currentMeta = { id: articleId, class: "a1", date: new Date().toISOString().split("T")[0], "name-it": "", "name-en": "", "desc-it": "", "desc-en": "", search: [] };
    }

    try {
      let res = await fetch(`/articles/${articleId}.json?t=${Date.now()}`);
      if (!res.ok) {
        res = await fetch(`/articles/${articleId}/article.json?t=${Date.now()}`);
      }
      if (res.ok) {
        currentBlocks = await res.json();
      } else {
        currentBlocks = [];
      }
    } catch (e) {
      console.warn("Impossibile caricare il JSON dell'articolo:", e);
      currentBlocks = [];
    }
    setupEditorUI();
  }
}

function setupEditorUI() {
  document.getElementById("editor-heading").innerText = articleId === 'new' ? `Nuovo Articolo #${currentMeta.id}` : `Modifica Articolo #${currentMeta.id}`;
  document.getElementById("meta-id").value = currentMeta.id;
  document.getElementById("meta-class").value = currentMeta.class;
  document.getElementById("meta-date").value = currentMeta.date;
  document.getElementById("meta-name-it").value = currentMeta["name-it"] || "";
  document.getElementById("meta-name-en").value = currentMeta["name-en"] || "";
  document.getElementById("meta-desc-it").value = currentMeta["desc-it"] || "";
  document.getElementById("meta-desc-en").value = currentMeta["desc-en"] || "";
  document.getElementById("meta-search").value = (currentMeta.search || []).join(", ");

  updateThemeClass();
  renderBlocks();
}

function updateThemeClass() {
  const cls = currentMeta ? currentMeta.class : "a0";
  document.body.className = "b" + cls;
  const favicon = document.getElementById("favicon");
  if (favicon) favicon.href = `/images/${cls}.svg`;
}

function syncMeta() {
  currentMeta.id = document.getElementById("meta-id").value.trim();
  currentMeta.class = document.getElementById("meta-class").value;
  currentMeta.date = document.getElementById("meta-date").value;
  currentMeta["name-it"] = document.getElementById("meta-name-it").value;
  currentMeta["name-en"] = document.getElementById("meta-name-en").value;
  currentMeta["desc-it"] = document.getElementById("meta-desc-it").value;
  currentMeta["desc-en"] = document.getElementById("meta-desc-en").value;
  currentMeta.search = document.getElementById("meta-search").value
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

// =========================================
// GESTIONE BLOCCHI
// =========================================
function addBlock(type) {
  let block = { type };
  switch (type) {
    case "text": block = { type: "text", newline: true, "content-it": "", "content-en": "" }; break;
    case "bold": block = { type: "bold", "content-it": "", "content-en": "" }; break;
    case "latex": block = { type: "latex", inline: false, formula: "" }; break;
    case "geogebra": block = { type: "geogebra", geogebraId: "" }; break;
    case "image": block = { type: "image", src: "", "caption-it": "", "caption-en": "", "alt-it": "", "alt-en": "" }; break;
    case "quote": block = { type: "quote", "content-it": "", "content-en": "", author: "" }; break;
    case "table": block = { type: "table", "headers-it": ["Colonna 1", "Colonna 2"], "headers-en": ["Column 1", "Column 2"], "rows-it": [["Valore 1", "Valore 2"]], "rows-en": [["Value 1", "Value 2"]] }; break;
    case "link": block = { type: "link", class: "external", url: "https://", id: "", "name-it": "", "name-en": "" }; break;
  }
  currentBlocks.push(block);
  renderBlocks();
}

function moveBlock(index, dir) {
  const target = index + dir;
  if (target < 0 || target >= currentBlocks.length) return;
  const temp = currentBlocks[index];
  currentBlocks[index] = currentBlocks[target];
  currentBlocks[target] = temp;
  renderBlocks();
}

function removeBlock(index) {
  currentBlocks.splice(index, 1);
  renderBlocks();
}

function renderBlocks() {
  const container = document.getElementById("blocks-container");
  container.innerHTML = currentBlocks.map((b, i) => {
    let fieldsHtml = "";
    if (b.type === "text" || b.type === "bold") {
      fieldsHtml = `
        <div class="editor-grid-2">
          <div class="editor-field"><label>Contenuto IT</label><textarea oninput="currentBlocks[${i}]['content-it']=this.value">${escapeHtml(b["content-it"] || "")}</textarea></div>
          <div class="editor-field"><label>Contenuto EN</label><textarea oninput="currentBlocks[${i}]['content-en']=this.value">${escapeHtml(b["content-en"] || "")}</textarea></div>
        </div>
        ${b.type === "text" ? `<label class="checkbox-row"><input type="checkbox" ${b.newline ? "checked" : ""} onchange="currentBlocks[${i}].newline=this.checked"> Nuovo paragrafo (newline: true)</label>` : ""}
      `;
    } else if (b.type === "latex") {
      fieldsHtml = `
        <div class="editor-field"><label>Formula LaTeX (senza $ o $$)</label><input type="text" value="${escapeAttr(b.formula || "")}" placeholder="E = mc^2" oninput="currentBlocks[${i}].formula=this.value"></div>
        <label class="checkbox-row"><input type="checkbox" ${b.inline ? "checked" : ""} onchange="currentBlocks[${i}].inline=this.checked"> Formula in linea nel testo (inline: true)</label>
      `;
    } else if (b.type === "geogebra") {
      fieldsHtml = `<div class="editor-field"><label>ID Materiale GeoGebra</label><input type="text" value="${escapeAttr(b.geogebraId || "")}" placeholder="es. x8k9p2qz" oninput="currentBlocks[${i}].geogebraId=this.value"></div>`;
    } else if (b.type === "image") {
      fieldsHtml = `
        <div class="editor-field"><label>Nome file immagine in /images/${escapeHtml(currentMeta.id)}/ (src)</label><input type="text" value="${escapeAttr(b.src || "")}" placeholder="diagramma.png" oninput="currentBlocks[${i}].src=this.value"></div>
        <div class="editor-grid-2">
          <div class="editor-field"><label>Didascalia IT</label><input type="text" value="${escapeAttr(b["caption-it"] || "")}" oninput="currentBlocks[${i}]['caption-it']=this.value"></div>
          <div class="editor-field"><label>Didascalia EN</label><input type="text" value="${escapeAttr(b["caption-en"] || "")}" oninput="currentBlocks[${i}]['caption-en']=this.value"></div>
        </div>
      `;
    } else if (b.type === "quote") {
      fieldsHtml = `
        <div class="editor-grid-2">
          <div class="editor-field"><label>Citazione IT</label><textarea oninput="currentBlocks[${i}]['content-it']=this.value">${escapeHtml(b["content-it"] || "")}</textarea></div>
          <div class="editor-field"><label>Citazione EN</label><textarea oninput="currentBlocks[${i}]['content-en']=this.value">${escapeHtml(b["content-en"] || "")}</textarea></div>
        </div>
        <div class="editor-field"><label>Autore</label><input type="text" value="${escapeAttr(b.author || "")}" oninput="currentBlocks[${i}].author=this.value"></div>
      `;
    } else if (b.type === "link") {
      fieldsHtml = `
        <div class="editor-grid-2">
          <div class="editor-field"><label>Tipo Link</label><select onchange="currentBlocks[${i}].class=this.value; renderBlocks();"><option value="external" ${b.class==="external"?"selected":""}>Esterno</option><option value="internal" ${b.class==="internal"?"selected":""}>Interno</option></select></div>
          <div class="editor-field"><label>${b.class==="internal"?"ID Articolo":"URL Esterno"}</label>${b.class==="internal"?`<input type="text" value="${escapeAttr(b.id||"")}" oninput="currentBlocks[${i}].id=this.value">`:`<input type="text" value="${escapeAttr(b.url||"")}" oninput="currentBlocks[${i}].url=this.value">`}</div>
        </div>
        <div class="editor-grid-2">
          <div class="editor-field"><label>Testo Link IT</label><input type="text" value="${escapeAttr(b["name-it"]||"")}" oninput="currentBlocks[${i}]['name-it']=this.value"></div>
          <div class="editor-field"><label>Testo Link EN</label><input type="text" value="${escapeAttr(b["name-en"]||"")}" oninput="currentBlocks[${i}]['name-en']=this.value"></div>
        </div>
      `;
    } else if (b.type === "table") {
      fieldsHtml = `
        <div class="table-actions"><button onclick="tableAddCol(${i})">+ Col</button><button onclick="tableDelCol(${i})">- Col</button><button onclick="tableAddRow(${i})">+ Riga</button><button onclick="tableDelRow(${i})">- Riga</button></div>
        <div class="table-editor-grid"><table><thead><tr>${b["headers-it"].map((h,c)=>`<th><input value="${escapeAttr(h)}" oninput="currentBlocks[${i}]['headers-it'][${c}]=this.value"><input style="margin-top:4px;" value="${escapeAttr(b["headers-en"][c]||"")}" oninput="currentBlocks[${i}]['headers-en'][${c}]=this.value"></th>`).join("")}</tr></thead><tbody>${b["rows-it"].map((row,r)=>`<tr>${row.map((cell,c)=>`<td><input value="${escapeAttr(cell)}" oninput="currentBlocks[${i}]['rows-it'][${r}][${c}]=this.value"><input style="margin-top:4px;" value="${escapeAttr((b["rows-en"][r]&&b["rows-en"][r][c])||"")}" oninput="currentBlocks[${i}]['rows-en'][${r}][${c}]=this.value"></td>`).join("")}</tr>`).join("")}</tbody></table></div>
      `;
    }
    return `<div class="block-card"><div class="block-header"><span class="block-type-tag">#${i+1} • ${b.type}</span><div class="block-controls"><button onclick="moveBlock(${i},-1)">↑</button><button onclick="moveBlock(${i},1)">↓</button><button class="a1" onclick="removeBlock(${i})">✕</button></div></div>${fieldsHtml}</div>`;
  }).join("");
}

function tableAddCol(idx) { currentBlocks[idx]["headers-it"].push("Col"); currentBlocks[idx]["headers-en"].push("Col"); currentBlocks[idx]["rows-it"].forEach(r=>r.push("")); currentBlocks[idx]["rows-en"].forEach(r=>r.push("")); renderBlocks(); }
function tableDelCol(idx) { if(currentBlocks[idx]["headers-it"].length<=1)return; currentBlocks[idx]["headers-it"].pop(); currentBlocks[idx]["headers-en"].pop(); currentBlocks[idx]["rows-it"].forEach(r=>r.pop()); currentBlocks[idx]["rows-en"].forEach(r=>r.pop()); renderBlocks(); }
function tableAddRow(idx) { const len = currentBlocks[idx]["headers-it"].length; currentBlocks[idx]["rows-it"].push(new Array(len).fill("")); currentBlocks[idx]["rows-en"].push(new Array(len).fill("")); renderBlocks(); }
function tableDelRow(idx) { if(currentBlocks[idx]["rows-it"].length<=1)return; currentBlocks[idx]["rows-it"].pop(); currentBlocks[idx]["rows-en"].pop(); renderBlocks(); }

// =========================================
// PREVIEW (Sfrutta direttamente /core/article.js)
// =========================================
function togglePreview() {
  syncMeta();
  isPreviewActive = !isPreviewActive;
  const ed = document.getElementById("view-editor");
  const pr = document.getElementById("view-preview");
  const btn = document.getElementById("btn-preview");

  if (isPreviewActive) {
    ed.classList.add("editor-hidden");
    pr.classList.remove("editor-hidden");
    btn.innerText = "✏️ Modifica";
    renderOfficialPreview();
  } else {
    pr.classList.add("editor-hidden");
    ed.classList.remove("editor-hidden");
    btn.innerText = "👁️ Preview";
  }
}

function setPreviewLang(lang) {
  previewLang = lang;
  document.getElementById("prev-lang-it").className = lang === "it" ? "a0" : "";
  document.getElementById("prev-lang-en").className = lang === "en" ? "a0" : "";
  renderOfficialPreview();
}

function renderOfficialPreview() {
  // Imposta le variabili globali richieste da article.js
  window.actuallang = previewLang;
  
  const title = currentMeta["name-" + previewLang] || "(Senza titolo)";
  const desc = currentMeta["desc-" + previewLang] || "";
  
  document.getElementById("article-title").innerText = title;
  document.title = title + " | Article Maker Preview";
  document.getElementById("desc").innerText = desc;
  document.getElementById("article-date").innerText = currentMeta.date || "";

  // Chiama direttamente la funzione di rendering ufficiale presente in /core/article.js
  if (typeof renderArticleContent === "function") {
    renderArticleContent(currentBlocks, currentMeta.id);
  } else {
    console.error("Funzione renderArticleContent non trovata. Controlla che /core/article.js sia caricato correttamente.");
  }
}

// =========================================
// DOWNLOAD
// =========================================
function downloadAllFiles() {
  syncMeta();
  if (!currentMeta.id) { alert("ID obbligatorio"); return; }

  const cleanBlocks = currentBlocks.map(b => {
    const copy = JSON.parse(JSON.stringify(b));
    if (copy.type === "link") { if (copy.class === "internal") delete copy.url; else delete copy.id; }
    return copy;
  });

  const updatedReg = JSON.parse(JSON.stringify(articlesRegistry));
  const idx = updatedReg.slice(1).findIndex(a => String(a.id) === String(currentMeta.id));
  if (idx !== -1) updatedReg[idx + 1] = JSON.parse(JSON.stringify(currentMeta));
  else updatedReg.push(JSON.parse(JSON.stringify(currentMeta)));
  updatedReg[0] = updatedReg.length - 1;

  // Sitemap
  let xml = rawSitemapXml;
  const id = currentMeta.id;
  const lastmod = currentMeta.date || new Date().toISOString().split("T")[0];
  const itLoc = `https://aldiladellatomo.eu/core/article.html?id=${id}&amp;lang=it`;
  const enLoc = `https://aldiladellatomo.eu/core/article.html?id=${id}&amp;lang=en`;

  if (xml.includes(`id=${id}&amp;lang=it`)) {
    const rIt = new RegExp(`(<loc>https:\\/\\/aldiladellatomo\\.eu\\/core\\/article\\.html\\?id=${id}&amp;lang=it<\\/loc>\\s*<lastmod>)[^<]+(<\\/lastmod>)`);
    const rEn = new RegExp(`(<loc>https:\\/\\/aldiladellatomo\\.eu\\/core\\/article\\.html\\?id=${id}&amp;lang=en<\\/loc>\\s*<lastmod>)[^<]+(<\\/lastmod>)`);
    xml = xml.replace(rIt, `$1${lastmod}$2`).replace(rEn, `$1${lastmod}$2`);
  } else {
    const newEntries = `\n  <!-- Articolo ${id} -->\n  <url>\n    <loc>${itLoc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>0.8</priority>\n  </url>\n  <url>\n    <loc>${enLoc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>0.8</priority>\n  </url>\n</urlset>`;
    xml = xml.replace("</urlset>", newEntries);
  }

  triggerDownload(`${currentMeta.id}.json`, JSON.stringify(cleanBlocks, null, 2), "application/json");
  setTimeout(() => triggerDownload("articles.json", JSON.stringify(updatedReg, null, 2), "application/json"), 250);
  setTimeout(() => triggerDownload("sitemap.xml", xml, "application/xml"), 500);
}

function triggerDownload(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(str) { return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function escapeAttr(str) { return escapeHtml(str).replace(/"/g, "&quot;"); }

initEditor();