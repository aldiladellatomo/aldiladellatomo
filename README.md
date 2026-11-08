# ⚛️ Al di là dell'atomo

Piattaforma web divulgativa ed educativa dedicata alle scienze, disponibile in **Italiano** e **Inglese**[cite: 1, 2, 3].

🌐 **Sito live:** [https://aldiladellatomo.eu](https://aldiladellatomo.eu)[cite: 2, 4]  
✍️ **Article Maker (Editor integrato):** Disponibile sul sito tramite il pulsante in basso o nella cartella `/editor/`[cite: 3].

---

## 📚 Materie trattate
Ogni area tematica dispone di un'identità cromatica dedicata (Material You) con supporto automatico al tema chiaro e scuro[cite: 1, 10]:

| Codice | Materia | Tema cromatico |
| :--- | :--- | :--- |
| **`a1`** | **Fisica** (*Physics*)[cite: 1, 10] | Rosso[cite: 10] |
| **`a2`** | **Matematica** (*Mathematics*)[cite: 1, 10] | Blu[cite: 10] |
| **`a3`** | **Chimica** (*Chemistry*)[cite: 1, 10] | Giallo / Ocra[cite: 10] |
| **`a4`** | **Biologia** (*Biology*)[cite: 1, 10] | Verde[cite: 10] |

---

## ✍️ Come creare e inviare un articolo con Article Maker

La piattaforma include un editor web integrato (**Article Maker**) accessibile direttamente dal footer del sito (`/editor/`)[cite: 3].

1. **Apri l'editor**: clicca sul pulsante *Article Maker* nella barra inferiore di qualsiasi pagina[cite: 3]. All'avvio caricherà automaticamente gli articoli esistenti[cite: 1].
2. **Crea o modifica**: premi il tasto **`+`** per creare un nuovo articolo (l'ID viene calcolato in automatico) oppure seleziona un articolo esistente[cite: 1, 7].
3. **Compila i metadati e i blocchi**: inserisci titolo, descrizione SEO, materia, data, tag e aggiungi i contenuti usando i blocchi interattivi (Testo, Grassetto, Formule **LaTeX**, applet **GeoGebra**, Immagini, Citazioni, Tabelle e Link)[cite: 1, 5, 6].
4. **Anteprima (Preview)**: controlla la formattazione grafica e la resa delle formule sia in **IT** che in **EN**[cite: 5, 6].
5. **Download**: clicca su **Download** per scaricare i file generati[cite: 1, 9]:
   - `{id}.json` (il contenuto strutturato dell'articolo)[cite: 9]
   - `articles.json` (il registro aggiornato con il contatore)[cite: 1]
   - `sitemap.xml` (la mappa del sito aggiornata)[cite: 1, 2]
6. **Invio via Email**: invia i file scaricati allegando anche le eventuali immagini all'indirizzo **[aldiladellatomo@gmail.com](mailto:aldiladellatomo@gmail.com)**[cite: 1, 3, 5].

---

## 🏗️ Struttura del repository
```text
/
├── home.html               # Home page con ricerca, filtri e carosello articoli recenti[cite: 3, 7]
├── sitemap.xml             # Mappa SEO multilingua[cite: 1, 2, 4]
├── robots.txt              # Direttive per i crawler[cite: 4]
├── core/
│   ├── article.html        # Pagina di visualizzazione articolo[cite: 5]
│   ├── article.js          # Motore di rendering dei blocchi JSON e MathJax[cite: 6]
│   ├── home.js             # Gestione elenco, ordinamento e ricerca[cite: 7]
│   ├── lang.js             # Cambio lingua IT/EN[cite: 8]
│   ├── script.js           # Utilità comuni e selettore lingua[cite: 9]
│   └── style.css           # Design system Material You condiviso con l'editor[cite: 10]
├── editor/
│   ├── index.html          # Interfaccia di Article Maker
│   └── script.js           # Logica dell'editor e generazione file
├── articles/
│   ├── articles.json       # Registro generale degli articoli[cite: 1, 9]
│   └── {id}.json           # File JSON dei singoli articoli[cite: 9]
├── images/
│   └── {id}/               # Risorse grafiche suddivise per ID articolo[cite: 1, 6]
└── lang/
    ├── it.json             # Traduzioni interfaccia IT[cite: 9]
    └── en.json             # Traduzioni interfaccia EN[cite: 9]