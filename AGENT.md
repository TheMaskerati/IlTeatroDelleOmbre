# Protocollo per Agente Senior (Principal Engineer)

Questo documento definisce gli obiettivi, la struttura tecnica e le regole di implementazione per "Il Teatro delle Ombre" (TOM). Deve essere utilizzato come riferimento primario per qualsiasi operazione di sviluppo o refactoring eseguita da un agente AI.

## Obiettivo del Gioco

TOM è un'esperienza narrativa e psicologica sviluppata in Phaser 3. Racconta il viaggio onirico di Gennaro Esposito attraverso il suo trauma generazionale, simboleggiato da una maschera di Pulcinella. Il gioco alterna esplorazione, dialoghi a scelta multipla e mini-giochi/battaglie concettuali.

### Pilastri Meccanici

- **Karma (Resistenza vs Cedimento)**: Traccia l'integrità morale del protagonista.
- **Tentazione della Maschera**: Una barra di pericolo che, se colmata, porta alla perdita di controllo (Game Over narrativo).
- **Dualità Narrativa**: Due finali principali basati sul comportamento del giocatore.

---

## Struttura Tecnica (Codebase)

### Stack Tecnologico

- **Motore**: Phaser 3 (Arcade Physics).
- **Linguaggio**: TypeScript.
- **Build Tool**: Vite.
- **Stile di Commento**: Obbligatoriamente multi-riga `/* ... */` o JSDoc.

### Gerarchia delle Scene (`src/scenes/`)

1. **BootScene**: Preloading asset (audio, texture procedurali).
2. **MenuScene**: Gestione salvataggi e inizializzazione stato.
3. **GameScene**: Cuore dell'esplorazione, gestione mappe e interazioni.
4. **BattleScene**: Sistema di combattimento a turni (Fight, Resist, Item, Flee).
5. **DialogScene**: Overlay per la narrativa basata su scelte.
6. **PauseScene**: Menu di interruzione e opzioni.
7. **EndingScene**: Gestione dei finali (Alba o Notte Eterna).

### Sistemi Centrali (`src/systems/`)

- **AudioManager (Singleton)**: Gestisce BGM e SFX con transizioni dinamiche basate sul punteggio di Maschera/Karma.
- **MapManager**: Rendering dinamico di livelli basato su dati JSON/Tiled o matrici interne.
- **MinigameManager**: Gestisce QTE e sfide di tempismo durante le sezioni di stress.
- **KarmaSystem**: Singleton che traccia `resistCount`, `fightCount` e decisioni chiave.
- **SaveSystem**: Persistenza su LocalStorage per progressi e statistiche.
- **MaskSystem**: Gestisce la barra della tentazione e gli effetti visivi (glitch camera).
- **DialogManager**: Orchestratore del flusso narrativo.
- **EffectsManager**: Feedback visivi (shake, flash).

### Entità (`src/entities/`)

- **Player**: Gestione movimento e area di interazione.
- **NPC**: Entità statiche o erranti con proprietà di dialogo e trigger di battaglia (EnemyConfig).

---

## Standard di Implementazione

### No Emoji

Le emoji sono severamente vietate sia nel codice che nella documentazione. Usare stringhe testuali o icone di sistema se necessario (es. [SUN] invece di un'emoji del sole).

### Localizzazione

Il testo del gioco è principalmente in Italiano. Mantenere la coerenza lessicale con i toni cupi e onirici del progetto.

### Gestione Commenti

Tutti i commenti a riga singola (`//`) devono essere convertiti nel formato multi-riga.

---

## Logica di Gameplay e Battle Flow

1. **Incontro**: Trigger di prossimità o dialogo.
2. **Battaglia**: Turn-based.
   - **AFFRONTA**: Danno alto, ma aumenta Tentazione e riduce Karma.
   - **RESISTI**: Recupero e controllo, aumenta Karma e riduce Tentazione.
3. **Punteggio Dinamico**: Il livello di Tentazione deve influenzare l'intensità della musica e la stabilità della telecamera (MaskSystem).

---

## Riferimenti Storici (Project Context)

Il gioco esplora temi di insonnia, magazzinaggio e vita teatrale a Napoli. La maschera non è un oggetto di scena, ma un parassita psicologico legato alla figura paterna.
