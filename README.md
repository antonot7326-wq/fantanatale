# FantaNatale

Fantacalcio natalizio di famiglia: i giocatori sono i vostri familiari, senza ruoli,
con rose più grandi delle formazioni e una giornata per ogni giorno reale delle festività.

Pensata per essere usata da persone anche non giovanissime: testi grandi (base 18px),
bottoni larghi, una barra di navigazione in basso sempre visibile come nelle app del telefono,
tema chiaro e scuro selezionabile in alto. I dialoghi sono sempre in-app, mai finestre del browser.
I punti base sono casuali; bonus e malus li assegna l'host. Nessun LLM; nessun dato inviato se non attivi la sincronizzazione.

## Il regolamento (dichiarato)

- **La classifica è a punti totali**: vince chi, sommando i punti di tutte le giornate, ne totalizza di più. Gli accoppiamenti del calendario sono indicativi ("stasera sfidatevi tra di voi"), non generano vittorie/sconfitte.
- **Pari merito**: due squadre con gli stessi punti occupano la stessa posizione.
- **Asta**: base d'asta 1 credito, quindi si può comprare a 1. Rilanci +1/+5/+10 o offerta libera. Una squadra non può mai superare i propri crediti: deve tenere almeno 1 credito per ogni posto di rosa ancora vuoto.
- **Rosa e titolari sono due cose diverse**: la rosa (default 6 giocatori) si costruisce all'asta; per ogni giornata si scelgono i titolari (default 4). La rosa non può essere più piccola della formazione.
- **Forza del giocatore** (1-10, default 5): chi è più forte genera più punti base. Si imposta dalla rosa.
- **Bonus e malus**: sono regole create dall'host e assegnate a mano con un tocco, mai casuali. Si possono modificare anche a giornata già calcolata: i totali si ricalcolano da soli e i punti base non cambiano.
- **"Annulla giornata"** non cancella più i bonus assegnati: si corregge un dimenticato senza ricalcolare da zero.

## Come funziona
1. **Impostazioni** (ingranaggio in alto) — nome della lega, chi calcola le giornate, crediti, titolari e rosa, date natalizie, squadre, bonus/malus, sincronizzazione, esporta e importa.
2. **Rose** — si aggiungono i familiari, si imposta la forza, si vedono le squadre con i loro giocatori.
3. **Asta** — base 1 credito, rilanci, offerta libera con tastiera numerica, vendita con addebito in crediti, cronologia acquisti con annullamento dell'ultimo.
4. **Formazioni** — si scelgono i titolari per la giornata; la formazione precedente viene ereditata (si parte dalla Home).
5. **Bonus e malus** — le regole le crei tu; a ogni giornata è l'host a decidere chi le prende, con un tocco. Niente di casuale.
6. **Giornate** — il calendario genera le sfide (round robin con andata e ritorno alternati, gestisce squadre dispari con il riposo sempre a destra). I punti base restano casuali: sono la "partita".
7. **Classifica** — punti totali, pari merito con stessa posizione, nota di regolamento sempre visibile.

Le date di default sono il prossimo Natale calcolato dinamicamente (24 dicembre → 6 gennaio), mai nel passato.

## Giocare da più telefoni (senza file)
L'app può sincronizzarsi da sola con Firebase Realtime Database (piano gratuito):
1. Crea un progetto su console.firebase.google.com
2. Nel menu «Realtime Database» crea il database (modalità test)
3. Copia l'URL che finisce per -rtdb.firebaseio.com
4. In FantaNatale: Impostazioni → «Gioco tra i telefoni» → incolla l'URL, scegli un nome di stanza, «Collega questo telefono»
5. Ripeti il punto 4 sugli altri telefoni: stessa URL, stesso nome di stanza

Da quel momento ogni modifica (asta, formazioni, giornate) arriva su tutti i telefoni in pochi secondi.
Se un telefono si collega a una stanza che contiene già una lega, l'app chiede cosa fare:
caricare la lega esistente o non toccare niente — annullare non sovrascrive mai la stanza.

### Attenzione alla «modalità test» di Firebase
Le regole di sicurezza della modalità test (`read`/`write` = `true`) **scadono dopo 30 giorni** e
**chiunque conosca l'URL e il nome della stanza può leggere o cancellare la lega**. Per una lega di famiglia va
bene lo stesso, ma sappilo: il nome della stanza è una password debolissima. Alternative:
- regole più strette che permettono lettura/scrittura solo dentro il path della stanza (es. `{"rules": {"famiglia-2026": {".read": true, ".write": true}}}`);
- scadenza personalizzata invece dei 30 giorni fissi;
- se preferisci evitare Firebase del tutto, usa Esporta/Importa su file (vedi sotto).

## Uso su più telefoni senza Firebase
Impostazioni → **Esporta su file** sul telefono di partenza, poi **Importa da file** su quello di arrivo.
Il file non contiene la configurazione di rete: la sync non viene copiata per sbaglio e nessun dato esce dal telefono se non lo esporti tu.

## Avvio rapido (chi ospita la lega)
```bash
npm install
npm run dev        # prova rapida su http://localhost:5173
npm test           # test della logica di gioco (Vitest)
```

## Lancio (dove pubblicare)
```bash
npm run build      # crea la cartella dist/
```
La cartella `dist/` è statica e funziona su qualunque hosting (GitHub Pages, Netlify, Vercel,
un NAS, una chiavetta servita localmente). I percorsi sono relativi, quindi funziona anche in sottocartelle.

## Installazione come app (Android e iPhone)
Niente store, niente account: l'app è una PWA e si installa dalla pagina web.
- **Android (Chrome)**: apri il sito, tocca i tre puntini in alto a destra → «Aggiungi alla schermata Home» oppure «Installa app». Nella Home dell'app compare anche il pulsante «Installa FantaNatale» quando il browser lo permette.
- **iPhone (Safari, obbligatorio Safari)**: apri il sito, tocca il pulsante Condividi (il quadratino con la freccia) → «Aggiungi alla schermata Home».

In entrambi i casi l'app parte a schermo intero con la sua icona, come le altre app, e funziona anche senza connessione.
Se non vedi la card con l'installazione in Home, vuol dire che l'app è già installata.

## Struttura del codice
Vedi [docs/STRUCTURE.md](docs/STRUCTURE.md): ogni parte è un file piccolo e isolato, pensato per essere letto e modificato separatamente.
I test della logica di gioco sono in `tests/` (`npm test`).
