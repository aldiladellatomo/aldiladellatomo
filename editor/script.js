const BASE_SITE_URL = "";

const SUBJECT_NAMES = {
  a1: "Fisica",
  a2: "Matematica",
  a3: "Chimica",
  a4: "Biologia"
};

let articlesRegistry = [0];
let rawSitemapXml = "";
let currentMeta = null;
let currentBlocks = [];
let previewLang = "it";

// =========================================
// 1. AVVIO E DOWNLOAD RELATIVO DAL DOMINIO
// =========================================
async function fetchRemoteData() {
  const statusText = document.getElementById("status-text");
  statusText.innerText = "Caricamento articles.json e sitemap.xml...";

  try {
    const [artRes, mapRes] = await Promise.all([
      fetch(`${BASE_SITE_URL}/articles/articles.json?t=${Date.now()}`),
      fetch(`${BASE_SITE_URL}/sitemap.xml?t=${Date.now()}`)
    ]);

    if (!artRes.ok) throw new Error("Errore HTTP articles.json: " + artRes.status);
    articlesRegistry = await artRes.json();

    if (mapRes.ok) {
      rawSitemapXml = await mapRes.text();
    } else {
      rawSitemapXml = getDefaultSitemapTemplate();
    }

    statusText.innerText = `✅ Caricati ${articlesRegistry.length - 1} articoli dal sito`;
  } catch (err) {
    console.warn("Errore caricamento file:", err);
    statusText.innerText = "⚠️ Impossibile leggere /articles/articles.json. Puoi importarlo manualmente o creare un nuovo articolo.";
    if (articlesRegistry.length <= 1) articlesRegistry = [0];
    if (!rawSitemapXml) rawSitemapXml = getDefaultSitemapTemplate();
  }

  renderHomeList();
}

function importLocalArticlesJson(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      articlesRegistry = JSON.parse(e.target.result);
      document.getElementById("status-text").innerText = `✅ Importati ${articlesRegistry.length - 1} articoli da file locale`;
      renderHomeList();
    } catch (err) {
      alert("File JSON non valido.");
    }
  };
  reader.readAsText(file);
}

function getDefaultSitemapTemplate() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://aldiladellatomo.eu/</loc>
    <lastmod>${todayISO()}</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`;
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

// =========================================
// 2. HOME PAGE E LISTA ARTICOLI
// =========================================
function renderHomeList() {
  const listEl = document.getElementById("articles-list");
  const query = document.getElementById("home-search").value.trim().toLowerCase();
  const classFilter = document.getElementById("home-filter-class").value;

  const items = articlesRegistry.slice(1).filter(art => {
    const matchClass = classFilter === "all" || art.class === classFilter;
    const matchQuery = !query ||
      String(art.id).includes(query) ||
      (art["name-it"] && art["name-it"].toLowerCase().includes(query)) ||
      (art["name-en"] && art["name-en"].toLowerCase().includes(query)) ||
      (Array.isArray(art.search) && art.search.some(t => t.toLowerCase().includes(query)));
    return matchClass && matchQuery;
  });

  items.sort((a, b) => Number(b.id) - Number(a.id));

  if (items.length === 0) {
    listEl.innerHTML = `<p style="text-align:center; opacity:0.7;">Nessun articolo trovato. Premi <strong>+</strong> in basso a destra per crearne uno.</p>`;
    return;
  }

  listEl.innerHTML = items.map(art => `
    <div class="editor-article-item ${art.class}" onclick="openArticleEditor('${art.id}')">
      <div>
        <h3>#${art.id} — ${escapeHtml(art["name-it"] || "Senza titolo")}</h3>
        <p>${escapeHtml(art["desc-it"] || "")}</p>
      </div>
      <div class="editor-article-meta">
        <span class="editor-badge">${SUBJECT_NAMES[art.class] || art.class}</span>
        <small style="opacity:0.8;">${art.date || ""}</small>
      </div>
    </div>
  `).join("");
}

// =========================================
// 3. APERTURA EDITOR (ESISTENTE O NUOVO)
// =========================================
async function openArticleEditor(articleId) {
  const found = articlesRegistry.slice(1).find(a => String(a.id) === String(articleId));
  if (!found) return;

  currentMeta = JSON.parse(JSON.stringify(found));
  currentBlocks = [];

  try {
    let res = await fetch(`${BASE_SITE_URL}/articles/${articleId}.json?t=${Date.now()}`);
    if (!res.ok) {
      res = await fetch(`${BASE_SITE_URL}/articles/${articleId}/article.json?t=${Date.now()}`);
    }
    if (res.ok) {
      currentBlocks = await res.json();
    }
  } catch (e) {
    console.warn("Impossibile scaricare il body dell'articolo:", e);
  }

  showEditorView(`Modifica Articolo #${articleId}`);
}

function createNewArticle() {
  const existingIds = articlesRegistry.slice(1).map(a => parseInt(a.id, 10)).filter(n => !isNaN(n));
  const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;

  currentMeta = {
    id: String(nextId),
    class: "a1",
    date: todayISO(),
    "name-it": "",
    "name-en": "",
    "desc-it": "",
    "desc-en": "",
    search: []
  };

  currentBlocks = [
    {
      type: "text",
      newline: true,
      "content-it": "",
      "content-en": ""
    }
  ];

  showEditorView(`Nuovo Articolo #${nextId}`);
}

function showEditorView(headingText) {
  document.getElementById("editor-heading").innerText = headingText;
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

  document.getElementById("view-home").classList.add("editor-hidden");
  document.getElementById("view-preview").classList.add("editor-hidden");
  document.getElementById("view-editor").classList.remove("editor-hidden");
  window.scrollTo(0, 0);
}

function goHome() {
  document.body.className = "ba0";
  const favicon = document.getElementById("favicon");
  if (favicon) favicon.href = "/images/a0.svg";

  document.getElementById("view-editor").classList.add("editor-hidden");
  document.getElementById("view-preview").classList.add("editor-hidden");
  document.getElementById("view-home").classList.remove("editor-hidden");
  renderHomeList();
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
// 4. GESTIONE BLOCCHI CONTENUTO
// =========================================
function addBlock(type) {
  let block = { type };
  switch (type) {
    case "text":
      block = { type: "text", newline: true, "content-it": "", "content-en": "" };
      break;
    case "bold":
      block = { type: "bold", "content-it": "", "content-en": "" };
      break;
    case "latex":
      block = { type: "latex", inline: false, formula: "" };
      break;
    case "geogebra":
      block = { type: "geogebra", geogebraId: "" };
      break;
    case "image":
      block = { type: "image", src: "", "caption-it": "", "caption-en": "", "alt-it": "", "alt-en": "" };
      break;
    case "quote":
      block = { type: "quote", "content-it": "", "content-en": "", author: "" };
      break;
    case "table":
      block = {
        type: "table",
        "headers-it": ["Colonna 1", "Colonna 2"],
        "headers-en": ["Column 1", "Column 2"],
        "rows-it": [["Valore 1", "Valore 2"]],
        "rows-en": [["Value 1", "Value 2"]]
      };
      break;
    case "link":
      block = { type: "link", class: "external", url: "https://", id: "", "name-it": "", "name-en": "" };
      break;
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
          <div class="editor-field">
            <label>Contenuto IT</label>
            <textarea oninput="currentBlocks[${i}]['content-it']=this.value">${escapeHtml(b["content-it"] || "")}</textarea>
          </div>
          <div class="editor-field">
            <label>Contenuto EN</label>
            <textarea oninput="currentBlocks[${i}]['content-en']=this.value">${escapeHtml(b["content-en"] || "")}</textarea>
          </div>
        </div>
        ${b.type === "text" ? `
          <label class="checkbox-row">
            <input type="checkbox" ${b.newline ? "checked" : ""} onchange="currentBlocks[${i}].newline=this.checked">
            Nuovo paragrafo (newline: true)
          </label>
        ` : ""}
      `;
    } else if (b.type === "latex") {
      fieldsHtml = `
        <div class="editor-field">
          <label>Formula LaTeX (senza $ o $$)</label>
          <input type="text" value="${escapeAttr(b.formula || "")}" placeholder="E = mc^2" oninput="currentBlocks[${i}].formula=this.value">
        </div>
        <label class="checkbox-row">
          <input type="checkbox" ${b.inline ? "checked" : ""} onchange="currentBlocks[${i}].inline=this.checked">
          Formula in linea nel testo (inline: true)
        </label>
      `;
    } else if (b.type === "geogebra") {
      fieldsHtml = `
        <div class="editor-field">
          <label>ID Materiale GeoGebra</label>
          <input type="text" value="${escapeAttr(b.geogebraId || "")}" placeholder="es. x8k9p2qz" oninput="currentBlocks[${i}].geogebraId=this.value">
        </div>
      `;
    } else if (b.type === "image") {
      fieldsHtml = `
        <div class="editor-field">
          <label>Nome file immagine in /images/${escapeHtml(currentMeta.id)}/ (src)</label>
          <input type="text" value="${escapeAttr(b.src || "")}" placeholder="diagramma.png" oninput="currentBlocks[${i}].src=this.value">
        </div>
        <div class="editor-grid-2">
          <div class="editor-field">
            <label>Didascalia IT (caption-it)</label>
            <input type="text" value="${escapeAttr(b["caption-it"] || "")}" oninput="currentBlocks[${i}]['caption-it']=this.value">
          </div>
          <div class="editor-field">
            <label>Didascalia EN (caption-en)</label>
            <input type="text" value="${escapeAttr(b["caption-en"] || "")}" oninput="currentBlocks[${i}]['caption-en']=this.value">
          </div>
        </div>
        <div class="editor-grid-2">
          <div class="editor-field">
            <label>Testo Alt IT (alt-it)</label>
            <input type="text" value="${escapeAttr(b["alt-it"] || "")}" oninput="currentBlocks[${i}]['alt-it']=this.value">
          </div>
          <div class="editor-field">
            <label>Testo Alt EN (alt-en)</label>
            <input type="text" value="${escapeAttr(b["alt-en"] || "")}" oninput="currentBlocks[${i}]['alt-en']=this.value">
          </div>
        </div>
      `;
    } else if (b.type === "quote") {
      fieldsHtml = `
        <div class="editor-grid-2">
          <div class="editor-field">
            <label>Citazione IT</label>
            <textarea oninput="currentBlocks[${i}]['content-it']=this.value">${escapeHtml(b["content-it"] || "")}</textarea>
          </div>
          <div class="editor-field">
            <label>Citazione EN</label>
            <textarea oninput="currentBlocks[${i}]['content-en']=this.value">${escapeHtml(b["content-en"] || "")}</textarea>
          </div>
        </div>
        <div class="editor-field">
          <label>Autore</label>
          <input type="text" value="${escapeAttr(b.author || "")}" placeholder="Albert Einstein" oninput="currentBlocks[${i}].author=this.value">
        </div>
      `;
    } else if (b.type === "link") {
      fieldsHtml = `
        <div class="editor-grid-2">
          <div class="editor-field">
            <label>Tipo Link (class)</label>
            <select onchange="currentBlocks[${i}].class=this.value; renderBlocks();">
              <option value="external" ${b.class === "external" ? "selected" : ""}>Esterno (external)</option>
              <option value="internal" ${b.class === "internal" ? "selected" : ""}>Articolo Interno (internal)</option>
            </select>
          </div>
          <div class="editor-field">
            <label>${b.class === "internal" ? "ID Articolo Destinazione" : "URL Esterno"}</label>
            ${b.class === "internal"
              ? `<input type="text" value="${escapeAttr(b.id || "")}" placeholder="es. 5" oninput="currentBlocks[${i}].id=this.value">`
              : `<input type="text" value="${escapeAttr(b.url || "")}" placeholder="https://..." oninput="currentBlocks[${i}].url=this.value">`
            }
          </div>
        </div>
        <div class="editor-grid-2">
          <div class="editor-field">
            <label>Testo Link IT (name-it)</label>
            <input type="text" value="${escapeAttr(b["name-it"] || "")}" oninput="currentBlocks[${i}]['name-it']=this.value">
          </div>
          <div class="editor-field">
            <label>Testo Link EN (name-en)</label>
            <input type="text" value="${escapeAttr(b["name-en"] || "")}" oninput="currentBlocks[${i}]['name-en']=this.value">
          </div>
        </div>
      `;
    } else if (b.type === "table") {
      fieldsHtml = renderTableEditor(b, i);
    }

    return `
      <div class="block-card">
        <div class="block-header">
          <span class="block-type-tag">#${i + 1} • ${b.type}</span>
          <div class="block-controls">
            <button onclick="moveBlock(${i}, -1)">↑</button>
            <button onclick="moveBlock(${i}, 1)">↓</button>
            <button class="a1" onclick="removeBlock(${i})">✕</button>
          </div>
        </div>
        ${fieldsHtml}
      </div>
    `;
  }).join("");
}

function renderTableEditor(b, idx) {
  return `
    <div class="table-actions">
      <button onclick="tableAddCol(${idx})">+ Colonna</button>
      <button onclick="tableDelCol(${idx})">- Colonna</button>
      <button onclick="tableAddRow(${idx})">+ Riga</button>
      <button onclick="tableDelRow(${idx})">- Riga</button>
    </div>
    <div class="table-editor-grid">
      <table>
        <thead>
          <tr>
            ${b["headers-it"].map((h, c) => `
              <th>
                <input placeholder="Header IT" value="${escapeAttr(h)}" oninput="currentBlocks[${idx}]['headers-it'][${c}]=this.value">
                <input placeholder="Header EN" style="margin-top:4px;" value="${escapeAttr(b["headers-en"][c] || "")}" oninput="currentBlocks[${idx}]['headers-en'][${c}]=this.value">
              </th>
            `).join("")}
          </tr>
        </thead>
        <tbody>
          ${b["rows-it"].map((row, r) => `
            <tr>
              ${row.map((cell, c) => `
                <td>
                  <input placeholder="Cella IT" value="${escapeAttr(cell)}" oninput="currentBlocks[${idx}]['rows-it'][${r}][${c}]=this.value">
                  <input placeholder="Cella EN" style="margin-top:4px;" value="${escapeAttr((b["rows-en"][r] && b["rows-en"][r][c]) || "")}" oninput="currentBlocks[${idx}]['rows-en'][${r}][${c}]=this.value">
                </td>
              `).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function tableAddCol(idx) {
  const b = currentBlocks[idx];
  b["headers-it"].push("Nuova Col");
  b["headers-en"].push("New Col");
  b["rows-it"].forEach(r => r.push(""));
  b["rows-en"].forEach(r => r.push(""));
  renderBlocks();
}

function tableDelCol(idx) {
  const b = currentBlocks[idx];
  if (b["headers-it"].length <= 1) return;
  b["headers-it"].pop();
  b["headers-en"].pop();
  b["rows-it"].forEach(r => r.pop());
  b["rows-en"].forEach(r => r.pop());
  renderBlocks();
}

function tableAddRow(idx) {
  const b = currentBlocks[idx];
  const len = b["headers-it"].length;
  b["rows-it"].push(new Array(len).fill(""));
  b["rows-en"].push(new Array(len).fill(""));
  renderBlocks();
}

function tableDelRow(idx) {
  const b = currentBlocks[idx];
  if (b["rows-it"].length <= 1) return;
  b["rows-it"].pop();
  b["rows-en"].pop();
  renderBlocks();
}

// =========================================
// 5. PREVIEW (Usa le stesse classi di /core/style.css)
// =========================================
function openPreview() {
  syncMeta();
  document.getElementById("view-editor").classList.add("editor-hidden");
  document.getElementById("view-preview").classList.remove("editor-hidden");
  renderPreview();
}

function closePreview() {
  document.getElementById("view-preview").classList.add("editor-hidden");
  document.getElementById("view-editor").classList.remove("editor-hidden");
}

function setPreviewLang(lang) {
  previewLang = lang;
  document.getElementById("prev-lang-it").className = lang === "it" ? "a0" : "";
  document.getElementById("prev-lang-en").className = lang === "en" ? "a0" : "";
  renderPreview();
}

function renderPreview() {
  document.getElementById("preview-title").innerText = currentMeta["name-" + previewLang] || "(Titolo vuoto)";
  document.getElementById("preview-desc").innerText = currentMeta["desc-" + previewLang] || "";
  document.getElementById("preview-date").innerText = currentMeta.date || "";

  let b = "";
  let paragraphOpen = false;

  for (let i = 0; i < currentBlocks.length; i++) {
    const item = currentBlocks[i];
    let isInline = false;
    let htmlChunk = "";

    switch (item.type) {
      case "text":
        htmlChunk = item["content-" + previewLang] || "";
        isInline = true;
        break;
      case "bold":
        htmlChunk = `<strong>${item["content-" + previewLang] || ""}</strong>`;
        isInline = true;
        break;
      case "link":
        if (item.class === "internal") {
          htmlChunk = `<a href="/core/article.html?id=${item.id}&lang=${previewLang}" class="internal">${item["name-" + previewLang] || ""}</a>`;
        } else {
          htmlChunk = `<a href="${item.url}" target="_blank" rel="noopener noreferrer" class="external">${item["name-" + previewLang] || ""}</a>`;
        }
        isInline = true;
        break;
      case "latex":
        if (item.inline) {
          htmlChunk = `<span class="latex-inline">$${item.formula || ""}$</span>`;
          isInline = true;
        } else {
          htmlChunk = `<div class="latex-block">$$${item.formula || ""}$$</div>`;
        }
        break;
      case "image":
        const cap = item["caption-" + previewLang] ? `<figcaption>${item["caption-" + previewLang]}</figcaption>` : "";
        htmlChunk = `<figure class="article-image"><img src="${BASE_SITE_URL}/images/${currentMeta.id}/${item.src}" alt="${item["alt-" + previewLang] || ""}" onerror="this.style.opacity=0.3">${cap}</figure>`;
        break;
      case "geogebra":
        htmlChunk = `<div class="geogebra-container"><iframe src="https://www.geogebra.org/material/iframe/id/${item.geogebraId}/width/800/height/500/border/888888/sfsb/true/smb/false/stb/false/stbh/false/ai/true/asb/0/sri/true/rc/false/ld/false/sdz/true/ctl/false" width="100%" height="500" style="border:0;"></iframe></div>`;
        break;
      case "quote":
        const author = item.author ? `<cite>— ${item.author}</cite>` : "";
        htmlChunk = `<blockquote class="article-quote"><p>«${item["content-" + previewLang] || ""}»</p>${author}</blockquote>`;
        break;
      case "table":
        const headers = item["headers-" + previewLang] || [];
        const rows = item["rows-" + previewLang] || [];
        htmlChunk = `<div class="table-container"><table class="article-table"><thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
        break;
    }

    if (item.newline === true && paragraphOpen) {
      b += "</p>";
      paragraphOpen = false;
    }

    if (isInline) {
      if (!paragraphOpen) {
        b += "<p>";
        paragraphOpen = true;
      }
      b += htmlChunk + " ";
    } else {
      if (paragraphOpen) {
        b += "</p>";
        paragraphOpen = false;
      }
      b += htmlChunk;
    }
  }

  if (paragraphOpen) b += "</p>";
  document.getElementById("content").innerHTML = b;

  if (window.MathJax && window.MathJax.typesetPromise) {
    MathJax.typesetPromise();
  }
}

// =========================================
// 6. DOWNLOAD: {id}.json, articles.json, sitemap.xml
// =========================================
function cleanBlocksForExport() {
  return currentBlocks.map(b => {
    const copy = JSON.parse(JSON.stringify(b));
    if (copy.type === "link") {
      if (copy.class === "internal") delete copy.url;
      else delete copy.id;
    }
    return copy;
  });
}

function buildUpdatedArticlesRegistry() {
  const updated = JSON.parse(JSON.stringify(articlesRegistry));
  const existingIdx = updated.slice(1).findIndex(a => String(a.id) === String(currentMeta.id));

  if (existingIdx !== -1) {
    updated[existingIdx + 1] = JSON.parse(JSON.stringify(currentMeta));
  } else {
    updated.push(JSON.parse(JSON.stringify(currentMeta)));
  }

  updated[0] = updated.length - 1;
  articlesRegistry = updated;
  return updated;
}

function buildUpdatedSitemap() {
  let xml = rawSitemapXml || getDefaultSitemapTemplate();
  const id = currentMeta.id;
  const lastmod = currentMeta.date || todayISO();

  const itLoc = `https://aldiladellatomo.eu/core/article.html?id=${id}&amp;lang=it`;
  const enLoc = `https://aldiladellatomo.eu/core/article.html?id=${id}&amp;lang=en`;

  if (xml.includes(`id=${id}&amp;lang=it`)) {
    const regexIt = new RegExp(`(<loc>https:\\/\\/aldiladellatomo\\.eu\\/core\\/article\\.html\\?id=${id}&amp;lang=it<\\/loc>\\s*<lastmod>)[^<]+(<\\/lastmod>)`);
    const regexEn = new RegExp(`(<loc>https:\\/\\/aldiladellatomo\\.eu\\/core\\/article\\.html\\?id=${id}&amp;lang=en<\\/loc>\\s*<lastmod>)[^<]+(<\\/lastmod>)`);
    xml = xml.replace(regexIt, `$1${lastmod}$2`).replace(regexEn, `$1${lastmod}$2`);
  } else {
    const newEntries = `
  <!-- Articolo ${id} -->
  <url>
    <loc>${itLoc}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${enLoc}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>0.8</priority>
  </url>
</urlset>`;
    xml = xml.replace("</urlset>", newEntries);
  }

  rawSitemapXml = xml;
  return xml;
}

function triggerDownload(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadAllFiles() {
  syncMeta();
  if (!currentMeta.id) {
    alert("Inserisci un ID valido per l'articolo prima di scaricare.");
    return;
  }

  const articleFilename = `${currentMeta.id}.json`;
  const articleJsonStr = JSON.stringify(cleanBlocksForExport(), null, 2);
  const registryJsonStr = JSON.stringify(buildUpdatedArticlesRegistry(), null, 2);
  const sitemapXmlStr = buildUpdatedSitemap();

  triggerDownload(articleFilename, articleJsonStr, "application/json");
  setTimeout(() => triggerDownload("articles.json", registryJsonStr, "application/json"), 250);
  setTimeout(() => triggerDownload("sitemap.xml", sitemapXmlStr, "application/xml"), 500);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, "&quot;");
}

fetchRemoteData();