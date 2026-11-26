# FantaNatale

Fantacalcio natalizio di famiglia: i giocatori sono i vostri familiari, senza ruoli,
con formazioni corte e una giornata per ogni giorno reale delle festività.

Pensata per essere usata da persone anche non giovanissime: testi grandi (base 18px),
bottoni larghi, una barra di navigazione in basso sempre visibile come nelle app del telefono,
tema chiaro e scuro selezionabile in alto.
I punti base sono casuali; bonus e malus li assegna l'host. Nessun LLM; nessun dato inviato se non attivi la sincronizzazione.

## Come funziona
1. **Impostazioni** (ingranaggio in alto) — nome della lega, chi calcola le giornate, crediti, numerosità formazioni, date natalizie, squadre, bonus/malus, esporta e importa.
2. **Rose** — si aggiungono i familiari e si vedono le squadre con i loro giocatori.
3. **Asta** — base d'asta 1 credito, rilanci +1/+10, offerta libera, vendita con addebito in crediti.
4. **Formazioni** — si scelgono gli schierati per ogni giornata; la formazione precedente viene ereditata (si parte dalla Home).
5. **Bonus e malus** — le regole le crei tu; a ogni giornata è l'host a decidere chi le prende, con un tocco. Niente di casuale.
6. **Giornate** — il calendario genera le sfide (round robin con andata e ritorno, gestisce squadre dispari con riposo). I punti base restano casuali: sono la "partita".
7. **Classifica** — punti totali e risultati di ogni giornata.

## Giocare da più telefoni (senza file)
L'app può sincronizzarsi da sola con Firebase Realtime Database (piano gratuito):
1. Crea un progetto su console.firebase.google.com
2. Nel menu «Realtime Database» crea il database (modalità test)
3. Copia l'URL che finisce per -rtdb.firebaseio.com
4. In FantaNatale: Impostazioni → «Gioco tra i telefoni» → incolla l'URL, scegli un nome di stanza, «Collega questo telefono»
5. Ripeti il punto 4 sugli altri telefoni: stessa URL, stesso nome di stanza

Da quel momento ogni modifica (asta, formazioni, giornate) arriva su tutti i telefoni in pochi secondi.

## Avvio rapido (chi ospita la lega)
```bash
npm install
npm run dev        # prova rapida su http://localhost:5173
```

## Lancio (dove pubblicare)
```bash
npm run build      # crea la cartella dist/
```
La cartella `dist/` è statica e funziona su qualunque hosting (GitHub Pages, Netlify, Vercel,
un NAS, una chiavetta servita localmente). I percorsi sono relativi, quindi funziona anche in sottocartelle.

## Uso su più telefoni
Ogni dispositivo ha la sua copia. Per spostare o aggiornare la lega:
Impostazioni → **Esporta su file** sul telefono di partenza, poi **Importa da file** su quello di arrivo.

## Installazione come app
Con la pagina pubblicata, sul telefono conviene «Aggiungi alla schermata Home»:
l'app parte a schermo intero, senza barra del browser, e funziona anche senza connessione.

## Struttura del codice
Vedi [docs/STRUCTURE.md](docs/STRUCTURE.md): ogni parte è un file piccolo e isolato, pensato per essere letto e modificato separatamente.
