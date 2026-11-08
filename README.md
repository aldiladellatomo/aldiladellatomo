# ⚛️ Al di là dell'atomo

Piattaforma web divulgativa ed educativa dedicata alle scienze, disponibile in **Italiano** e **Inglese**, progettata con un'architettura statica leggera, veloce e data-driven[cite: 1, 2, 3, 9].

🌐 **Sito live:** [https://aldiladellatomo.eu](https://aldiladellatomo.eu)[cite: 2, 4]  
✍️ **Editor Articoli:** [Article Maker](https://github.com/aldiladellatomo/article-maker)

---

## 📚 Materie trattate
Ogni area tematica dispone di un'identità cromatica dedicata con supporto automatico al tema chiaro e scuro[cite: 1, 10]:

| Codice | Materia | Tema |
| :--- | :--- | :--- |
| **`a1`** | **Fisica** (*Physics*)[cite: 1, 10] | Rosso[cite: 10] |
| **`a2`** | **Matematica** (*Mathematics*)[cite: 1, 10] | Blu[cite: 10] |
| **`a3`** | **Chimica** (*Chemistry*)[cite: 1, 10] | Giallo / Ocra[cite: 10] |
| **`a4`** | **Biologia** (*Biology*)[cite: 1, 10] | Verde[cite: 10] |

---

## ✍️ Come creare e inviare un articolo con Article Maker

Per contribuire al sito con un nuovo articolo (o proporre modifiche a uno esistente) si utilizza **[Article Maker](https://github.com/aldiladellatomo/article-maker)**, l'editor visuale ufficiale della piattaforma.

### 1. Avvia l'editor
1. Apri **[Article Maker](https://github.com/aldiladellatomo/article-maker)**: all'avvio scaricherà automaticamente l'elenco aggiornato degli articoli presenti sul sito[cite: 1, 9].
2. Premi il pulsante **`+`** in basso a destra per iniziare un nuovo articolo (l'ID progressivo viene assegnato automaticamente), oppure clicca su un articolo già esistente per modificarlo[cite: 1].

### 2. Compila i metadati dell'articolo
Inserisci le informazioni principali nella scheda iniziale dell'editor[cite: 1]:
* **Materia (`class`)**: scegli tra `a1` (Fisica), `a2` (Matematica), `a3` (Chimica) o `a4` (Biologia)[cite: 1].
* **Data**: imposta la data di pubblicazione nel formato `YYYY-MM-DD`[cite: 1].
* **Titolo (`name-it` / `name-en`)**: scrivi il titolo sia in italiano che in inglese[cite: 1].
* **Descrizione (`desc-it` / `desc-en`)**: aggiungi una breve descrizione riassuntiva per la SEO e la ricerca interna[cite: 1].
* **Tag di ricerca (`search`)**: inserisci parole chiave separate da virgola[cite: 1].

### 3. Costruisci il contenuto a blocchi
Usa la barra inferiore dell'editor per aggiungere e ordinare i vari elementi dell'articolo in entrambe le lingue[cite: 1]:
* **Testo & Grassetto**: paragrafi standard (con opzione `newline` per andare a capo) ed evidenziazioni nel colore della materia[cite: 1, 6].
* **Formule LaTeX**: equazioni matematiche renderizzate tramite MathJax, sia in linea nel testo (`inline`) che centrati a blocco[cite: 1, 5, 6].
* **GeoGebra**: inserisci l'ID di un materiale GeoGebra per integrare grafici interattivi[cite: 1, 6].
* **Immagini**: indica il nome del file (es. `diagramma.png`), didascalia e testo alternativo in italiano e inglese[cite: 1, 6].
* **Citazioni, Tabelle e Link**: aggiungi citazioni con autore, tabelle dinamiche e collegamenti ad altri articoli del sito (`internal`) o a fonti esterne (`external`)[cite: 1, 6].

### 4. Controlla l'anteprima e scarica i file
1. Premi **Preview** per verificare l'aspetto finale dell'articolo e la corretta formattazione delle formule sia in **IT** che in **EN**[cite: 5, 6].
2. Premi **Download** per scaricare sul tuo dispositivo i tre file generati dall'editor[cite: 1, 9]:
   * `{id}.json` (il contenuto dell'articolo)[cite: 9]
   * `articles.json` (l'indice aggiornato degli articoli)[cite: 1]
   * `sitemap.xml` (la mappa del sito aggiornata)[cite: 1, 2]

### 5. Invia l'articolo via Email
Una volta scaricati i file, **inviali per email a [aldiladellatomo@gmail.com](mailto:aldiladellatomo@gmail.com)**:
* Indica nell'oggetto il titolo e l'ID dell'articolo (es. *Nuovo articolo #6 — Titolo*).
* Allega i file scaricati (`{id}.json`, `articles.json`, `sitemap.xml`) insieme a **tutte le eventuali immagini** inserite nell'articolo[cite: 1, 2, 9].

---

## 🏗️ Struttura del repository
```text
/
├── home.html               # Home page con ricerca, filtri e articoli recenti[cite: 3, 7]
├── sitemap.xml             # Mappa SEO multilingua[cite: 1, 2, 4]
├── robots.txt              # Direttive per i motori di ricerca[cite: 4]
├── core/
│   ├── article.html        # Pagina di lettura articolo[cite: 5]
│   ├── article.js          # Motore di rendering dei blocchi JSON[cite: 6]
│   ├── home.js             # Gestione elenco articoli, ordinamento e ricerca[cite: 7]
│   ├── lang.js             # Cambio lingua IT/EN[cite: 8]
│   ├── script.js           # Caricamento dati e utilità comuni[cite: 9]
│   └── style.css           # Stili Material You e layout responsive[cite: 10]
├── articles/
│   ├── articles.json       # Registro generale degli articoli[cite: 1, 9]
│   └── {id}.json           # File JSON dei singoli articoli[cite: 9]
├── images/
│   └── {id}/               # Immagini suddivise per ID articolo[cite: 1, 6]
└── lang/
    ├── it.json             # Traduzioni interfaccia IT[cite: 9]
    └── en.json             # Traduzioni interfaccia EN[cite: 9]