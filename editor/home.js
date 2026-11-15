let articlesRegistry = [0];
let rawSitemapXml = "";

async function fetchRemoteData() {
  const statusText = document.getElementById("status-text");
  statusText.innerText = "Caricamento articles.json e sitemap.xml...";

  try {
    const [artRes, mapRes] = await Promise.all([
      fetch(`/articles/articles.json?t=${Date.now()}`),
      fetch(`/sitemap.xml?t=${Date.now()}`)
    ]);

    if (!artRes.ok) throw new Error("Errore HTTP articles.json");
    articlesRegistry = await artRes.json();

    if (mapRes.ok) {
      rawSitemapXml = await mapRes.text();
    } else {
      rawSitemapXml = getDefaultSitemapTemplate();
    }

    sessionStorage.setItem("articlesRegistry", JSON.stringify(articlesRegistry));
    sessionStorage.setItem("rawSitemapXml", rawSitemapXml);

    statusText.innerText = `✅ Caricati ${articlesRegistry.length - 1} articoli dal sito`;
  } catch (err) {
    console.warn("Errore caricamento file:", err);
    statusText.innerText = "⚠️ Impossibile leggere dal server. Importa articles.json manualmente o crea un articolo.";
    
    const cached = sessionStorage.getItem("articlesRegistry");
    if (cached) {
      articlesRegistry = JSON.parse(cached);
    } else if (articlesRegistry.length <= 1) {
      articlesRegistry = [0];
    }
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
      sessionStorage.setItem("articlesRegistry", JSON.stringify(articlesRegistry));
      document.getElementById("status-text").innerText = `✅ Importati ${articlesRegistry.length - 1} articoli da file locale`;
      renderHomeList();
    } catch (err) {
      alert("File JSON non valido.");
    }
  };
  reader.readAsText(file);
}

// Funzione per caricare un file JSON di contenuto articolo specifico
function uploadArticleJson(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const blocks = JSON.parse(e.target.result);
      sessionStorage.setItem("uploaded_blocks", JSON.stringify(blocks));
      sessionStorage.setItem("uploaded_filename", file.name);
      // Reindirizza all'editor con id=uploaded
      window.location.href = "edit.html?id=uploaded";
    } catch (err) {
      alert("Il file JSON dell'articolo non è valido.");
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
    listEl.innerHTML = `<p style="text-align:center; opacity:0.7;">Nessun articolo trovato. Premi <strong>+</strong> in basso a destra per crearne uno o carica un JSON.</p>`;
    return;
  }

  listEl.innerHTML = items.map(art => `
    <div class="editor-article-item ${art.class}" onclick="window.location.href='edit.html?id=${art.id}'">
      <div>
        <h3>#${art.id} — ${escapeHtml(art["name-it"] || "Senza titolo")}</h3>
        <p>${escapeHtml(art["desc-it"] || "")}</p>
      </div>
      <div class="editor-article-meta">
        <span class="editor-badge">${art.class}</span>
        <small style="opacity:0.8;">${art.date || ""}</small>
      </div>
    </div>
  `).join("");
}

function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

fetchRemoteData();