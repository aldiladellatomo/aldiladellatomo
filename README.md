# Guida alla Pubblicazione Articoli — Al di là dell'atomo

Questa guida descrive i passaggi operativi per aggiungere un nuovo articolo alla piattaforma.

---

## 1. Registro Articoli (`/articles/articles.json`)

Apri il file `/articles/articles.json`:
1. Incrementa di **1** il valore all'indice `0` (contatore totale degli articoli).
2. Aggiungi il nuovo oggetto metadati in fondo all'array:

```json
[
  16,
  {
    "id": "16",
    "class": "a1",
    "date": "2026-08-20",
    "name-it": "Titolo dell'articolo",
    "name-en": "Article Title",
    "desc-it": "Descrizione sintetica dell'articolo per la SEO e la ricerca interna.",
    "desc-en": "Short article description for SEO and internal search.",
    "search": ["parola1", "parola2", "tag"]
  }
]
```

**Mappa delle classi (`class`):**
* `a1`: Fisica
* `a2`: Matematica
* `a3`: Chimica
* `a4`: Biologia

---

## 2. Contenuto dell'Articolo (`/articles/{id}/article.json`)

Crea la cartella `/articles/{id}/` (es. `/articles/16/`) e al suo interno crea il file `article.json`.

Popola il file con un array di blocchi scegliendo tra i tipi supportati:

```json
[
  {
    "type": "text",
    "content-it": "Testo del paragrafo in italiano.",
    "content-en": "Paragraph text in English."
  },
  {
    "type": "bold",
    "content-it": "Testo evidenziato con il colore di sfondo della materia.",
    "content-en": "Highlighted text with subject theme color."
  },
  {
    "type": "latex",
    "formula": "E = mc^2"
  },
  {
    "type": "latex",
    "inline": true,
    "formula": "F = m \\cdot a"
  },
  {
    "type": "geogebra",
    "geogebraId": "id_del_materiale"
  },
  {
    "type": "image",
    "src": "diagramma.png",
    "caption-it": "Didascalia",
    "caption-en": "Caption",
    "alt-it": "Testo alternativo",
    "alt-en": "Alt text"
  },
  {
    "type": "quote",
    "content-it": "Citazione o aforisma.",
    "content-en": "Quote or aphorism.",
    "author": "Nome Autore"
  },
  {
    "type": "table",
    "headers-it": ["Intestazione 1", "Intestazione 2"],
    "headers-en": ["Header 1", "Header 2"],
    "rows-it": [
      ["Valore 1", "Valore 2"]
    ],
    "rows-en": [
      ["Value 1", "Value 2"]
    ]
  },
  {
    "type": "link",
    "class": "external",
    "url": "[https://sitoesterno.com](https://sitoesterno.com)",
    "name-it": "Link Esterno",
    "name-en": "External Link"
  },
  {
    "type": "link",
    "class": "internal",
    "id": "5",
    "name-it": "Articolo correlato",
    "name-en": "Related article"
  }
]
```

---

## 3. Gestione Immagini (`/images/{id}/`)

Se l'articolo contiene elementi di tipo `"image"`:
1. Crea la cartella `/images/{id}/` (es. `/images/16/`).
2. Inserisci i file immagine con il nome corrispondente alla proprietà `"src"`.

---

## 4. Indicizzazione SEO (`/sitemap.xml`)

Aggiungi le nuove URL dell'articolo nel file `sitemap.xml` prima del tag `</urlset>`:

```xml
  <url>
    <loc>[https://aldiladellatomo.eu/core/article.html?id=16&amp;lang=it](https://aldiladellatomo.eu/core/article.html?id=16&amp;lang=it)</loc>
    <lastmod>2026-08-20</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>[https://aldiladellatomo.eu/core/article.html?id=16&amp;lang=en](https://aldiladellatomo.eu/core/article.html?id=16&amp;lang=en)</loc>
    <lastmod>2026-08-20</lastmod>
    <priority>0.8</priority>
  </url>
```

