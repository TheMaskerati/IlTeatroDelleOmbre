# IL TEATRO DELLE OMBRE - GAME DESIGN DOCUMENT

## 1. VISIONE GENERALE

**Titolo:** Il Teatro delle Ombre
**Genere:** Avventura narrativa / Psychological Horror / Visual Novel
**Piattaforme:** PC (Windows/Linux/Mac), Web, Mobile (Touch supported)
**Target:** 16+ (Temi psicologici, horror moderato)

### Pitch

Gennaro, un uomo tormentato dai fallimenti, si ritrova intrappolato in una versione distorta di Napoli dove le sue paure prendono forma. Per svegliarsi, deve affrontare le Maschere che governano questo mondo onirico: Pulcinella (l'inganno), Pantalone (l'avidità) e il Dottore (l'arroganza). Ogni scelta influisce sulla sua Anima (Karma) e determina se sconfiggerà le sue ombre o ne verrà consumato.

### Design Pillars

1. **L'Atmosfera prima di tutto:** Un mix unico di folklore napoletano e horror psicologico. Luci calde ma minacciose, ombre lunghe, musica orchestrale malinconica.
2. **Scelte che pesano:** Non c'è un "giusto" o "sbagliato" banale. Cedere alla Maschera è facile e potente, resistere è difficile ma giusto.
3. **Il Teatro come metafora:** La vita è una recita. Le maschere che indossiamo per proteggerci possono diventare la nostra prigione.

---

## 2. STORIA E LORE

### Premessa

Gennaro Esposito è un ex attore di teatro fallito che vive di rimpianti nel quartiere Sanità. Una notte, dopo aver bevuto troppo, sviene nel suo appartamento e si risveglia nel "Teatro delle Ombre", una dimensione onirica che riflette la sua psiche spezzata.

### Personaggi Principali

* **Gennaro (Protagonista):** Un uomo comune, stanco e disilluso. Cerca redenzione.
* **L'Ombra (Antagonista/Guida):** La manifestazione oscura di Gennaro. Lo tenta costantemente con scorciatoie facili.
* **Il Padre (Boss Finale):** Rappresenta l'autorità e il giudizio che Gennaro teme.

### Le Maschere (Boss)

Le Maschere sono i guardiani delle paure di Gennaro.

1. **Scugnizio (Vicolo):** Rappresenta l'infanzia perduta e la sopravvivenza amorale. Minigame frenetico.
2. **Attrice Decaduta (Teatro):** Rappresenta la vanità e la paura dell'invecchiamento. Minigame di ritmo/timing.
3. **L'Ombra Gigante:** La somma di tutte le paure.

---

## 3. GAMEPLAY MECHANICS

### Core Loop

Esplorazione (Top-down) -> Dialogo con NPC (Scelte) -> Minigame (Combattimento/Sfida) -> Progressione Storia.

### 1. Sistema di Karma (Anima)

* Ogni scelta di dialogo ha un peso:
  * **Resistenza (Karma +):** Difficile, richiede sacrificio, porta al finale "Reale".
  * **Maschera (Karma -):** Facile, egoista, porta al finale "Illusione".
* Il Karma influenza:
  * L'aspetto del medaglione nell'HUD.
  * Le reazioni degli NPC.
  * Il finale del gioco.

### 2. Sistema di Dialogo

* Testo a comparsa (Typewriter effect).
* Scelte multiple (di solito 2-3 opzioni).
* **Timeout:** Alcune scelte critiche hanno un timer di 10s per mettere pressione.
* **Voice Blips:** Suoni procedurali che simulano la voce.

### 3. Minigames "Battaglia"

Invece di combattimenti classici, si affrontano sfide mentali metaforiche:

* **Balance:** Mantenere l'equilibrio mentale (cursore al centro).
* **Rhythm:** Seguire il ritmo del cuore (timing).
* **Focus:** Inseguire la luce (mouse tracking).
* **QTE (Mash):** Ribellarsi alla pressione (button mashing).
* **Memory:** Ricordare il passato (coppie).
* **Breath:** Calmare il respiro (timing lento).

### 4. Endless Mode

Una modalità sbloccabile (o integrata nel post-game) dove Gennaro cicla tra le mappe all'infinito.

* La difficoltà scala (timer più brevi, più ostacoli).
* **Mind Tricks:** Distorsioni visive e audio a stadi avanzati (Zoom, Sway, Tinta rossa).

---

## 4. PROGRESSIONE E LIVELLI

### Map 1: L'Appartamento (Tutorial)

* **Mood:** Claustrofobico, disordinato.
* **Obiettivo:** Imparare i controlli base e uscire dalla stanza.
* **Boss:** Nessuno (Tutorial Dialogo).

### Map 2: Il Vicolo (Napoli Oscura)

* **Mood:** Umido, buio, neon tremolanti.
* **Nemici:** Scugnizzi ombra.
* **Minigame:** Reaction / QTE.

### Map 3: Il Teatro (Atto II)

* **Mood:** Grandioso ma decadente, velluto rosso.
* **Boss:** L'Attrice.
* **Minigame:** Rhythm / Memory.

### Map 4: Casa del Padre (Finale)

* **Mood:** Freddo, austero, bianco e nero deformato.
* **Boss:** Il Padre.
* **Minigame:** Tutti i tipi in sequenza (Boss Rush).

---

## 5. ART & AUDIO

### Stile Visivo

* **Pixel Art Procedurale:** Personaggi e oggetti generati via codice (Canvas API) per uno stile unico e "instabile".
* **Luci:** Uso intensivo di `light2d` (se supportato) o masking per creare coni di luce e ombra.
* **Colori:**
  * Reale: Toni caldi, terra.
  * Ombra: Viola, ciano neon, nero profondo.

### Audio Design

* **Musica Adattiva:** La musica cambia intensità o velocità (Pitch) in base allo stress/stage.
* **Soundscape:** Rumori ambientali costanti (pioggia lontana, traffico ovattato, sussurri).

---

## 6. INTERFACCIA UTENTE (UI)

* **HUD:** Minimale. Barra controllo Maschera, Karma Medallion, Obiettivo corrente.
* **Menu:** Elegante, font serif (Georgia), pulsanti reattivi.
* **Input:** Supporto ibrido Mouse/Tastiera e Touch (Virtual Joystick).

---

*Documento aggiornato il: 30 Gennaio 2026*
*Versione: 1.0*
