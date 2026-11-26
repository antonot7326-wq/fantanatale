# Mappa del progetto

Ogni parte è un file piccolo e separato, così è facile capire e modificare una cosa alla volta.

## Punto di ingresso
| File | Contenuto |
|---|---|
| `index.html` | Pagina unica dove carica l'app |
| `src/main.jsx` | Avvio di React + registrazione del service worker |
| `src/App.jsx` | Passa da una scheda all'altra (menu → pagina → menu) |

## Stato e regole di gioco
| File | Contenuto |
|---|---|
| `src/state/store.jsx` | Dove vivono i dati (localStorage) e tutti i cambiamenti |
| `src/state/selectors.js` | Domande già pronte: crediti rimasti, rose, se l'asta è completa |
| `src/lib/schedule.js` | Calendario: giorni reali e accoppiamenti round robin |
| `src/lib/sim.js` | Motore della simulazione: punti base casuali + eventi bonus/malus |
| `src/lib/sync.js` | Sincronizzazione Firebase REST (pull/push, zero dipendenze) |
| `src/lib/data.js` | Lettura della formazione di una giornata (con eredità dalla precedente) |

## Componenti di interfaccia (riusabili)
| File | Contenuto |
|---|---|
| `src/ui/parts.jsx` | Bottoni, schede, campi, stepper +/−, tabelle, titolo con «‹ Menu» |
| `src/ui/icons.jsx` | Icone SVG della barra di navigazione (niente emoji) |
| `src/ui/theme.css` | Colori e dimensioni: font grandi, contrasto alto |

## Schermate (una per file, nessuna fa tutto)
| File | Contenuto |
|---|---|
| `src/screens/HomeScreen.jsx` | Home: prossima giornata, azioni rapide, stato della lega |
| `src/screens/SetupScreen.jsx` | Impostazioni della lega + salvataggio (esporta/importa/azzeramento) |
| `src/screens/TeamsEditor.jsx` | Solo la lista delle squadre |
| `src/screens/RoseScreen.jsx` | Tab Rose: giocatori liberi + rosa di ogni squadra |
| `src/screens/RulesScreen.jsx` | Bonus e malus: inserimento e elenco |
| `src/screens/EventRow.jsx` | Una singola regola bonus/malus |
| `src/screens/AuctionScreen.jsx` | Asta: crediti, giocatori liberi, chiusura |
| `src/screens/AuctionLot.jsx` | Il giocatore in vendita: offerte e vendita |
| `src/screens/LineupsScreen.jsx` | Formazioni: giornata + squadre |
| `src/screens/MatchdaysScreen.jsx` | Giornate: scelta del giorno e calcolo |
| `src/screens/AssignPanel.jsx` | Assegnazione manuale di bonus e malus a ogni giocatore |
| `src/screens/DayCard.jsx` | Una giornata: accoppiamenti, punteggi, dettaglio |
| `src/screens/StandingsScreen.jsx` | Classifica a punti |
| `public/sw.js` | Supporto per usare l'app senza connessione |
| `public/manifest.webmanifest` | Installabile su telefono (icone comprese) |
