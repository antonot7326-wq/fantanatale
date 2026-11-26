# Mappa del progetto

Ogni parte è un file piccolo e separato, così è facile capire e modificare una cosa alla volta.

## Punto di ingresso
| File | Contenuto |
|---|---|
| `index.html` | Pagina unica dove carica l'app (tema applicato prima del primo disegno) |
| `src/main.jsx` | Avvio di React + registrazione del service worker |
| `src/App.jsx` | Navigazione con indirizzo a hash (`#/asta`, `#/giornate`…): il tasto indietro del telefono funziona, schermata protetta da Error Boundary |

## Stato e regole di gioco
| File | Contenuto |
|---|---|
| `src/state/store.jsx` | Dove vivono i dati (localStorage `fantanatale-v1`), normalizzazione con `schemaVersion`, sincronizzazione tra telefoni |
| `src/state/selectors.js` | Domande già pronte: crediti rimasti, rose, dimensione rosa, se l'asta è completa |
| `src/lib/schedule.js` | Calendario: giorni reali in ora locale, accoppiamenti round robin con andata/ritorno alternati, riposo sempre a destra |
| `src/lib/sim.js` | Motore della simulazione: punti base casuali pesati sulla forza, punti salvati con la giornata |
| `src/lib/auction.js` | Logica dell'asta come funzioni pure: offerta massima, guardie sui lotti, vendita, annullamento acquisti |
| `src/lib/sync.js` | Sincronizzazione Firebase REST (pull/push, zero dipendenze) |
| `src/lib/data.js` | Lettura della formazione di una giornata (`lineupFor`, con eredità dalla precedente) |

## Componenti di interfaccia (riusabili)
| File | Contenuto |
|---|---|
| `src/ui/parts.jsx` | Bottoni, schede, campi, stepper +/−, tabelle, titolo con «Indietro» |
| `src/ui/dialog.jsx` | Dialoghi in-app (al posto di alert/confirm del browser), con Promise |
| `src/ui/icons.jsx` | Icone SVG della barra di navigazione (niente emoji) |
| `src/ui/theme.css` | Colori e dimensioni: font grandi, contrasto alto, tema chiaro/scuro |

## Schermate (una per file, nessuna fa tutto)
| File | Contenuto |
|---|---|
| `src/screens/HomeScreen.jsx` | Home: prossima giornata, azioni rapide, stato della lega |
| `src/screens/InstallCard.jsx` | Card «Metti l'app sul telefono»: pulsante di installazione su Android, istruzioni passo-passo su iPhone |
| `src/screens/SetupScreen.jsx` | Impostazioni della lega + sincronizzazione + esporta/importa/azzeramento |
| `src/screens/TeamsEditor.jsx` | Solo la lista delle squadre |
| `src/screens/RoseScreen.jsx` | Tab Rose: giocatori liberi + rosa di ogni squadra, forza di ogni giocatore |
| `src/screens/RulesScreen.jsx` | Bonus e malus: inserimento, modifica ed elenco |
| `src/screens/EventRow.jsx` | Una singola regola bonus/malus |
| `src/screens/AuctionScreen.jsx` | Asta: crediti, giocatori liberi, lotti bloccati con sblocco, cronologia acquisti |
| `src/screens/AuctionLot.jsx` | Il giocatore in vendita: offerte, vendita alla squadra giusta |
| `src/screens/LineupsScreen.jsx` | Formazioni: giornata + squadre |
| `src/screens/MatchdaysScreen.jsx` | Giornate: scelta del giorno e calcolo |
| `src/screens/AssignPanel.jsx` | Assegnazione manuale di bonus e malus a ogni giocatore, ricalcolo a giornata calcolata |
| `src/screens/DayCard.jsx` | Una giornata: accoppiamenti, punteggi, dettaglio |
| `src/screens/StandingsScreen.jsx` | Classifica a punti totali con pari merito |
| `src/screens/GuestScreen.jsx` | Modalità ospite: solo nome della lega e classifica aggiornata, senza modifiche |
| `public/sw.js` | Supporto per usare l'app senza connessione (cache v4) |
| `public/manifest.webmanifest` | Installabile su telefono (icone normali e maskable) |

## Test
| File | Contenuto |
|---|---|
| `tests/schedule.test.js` | Calendario: round robin 2-5 squadre, andata/ritorno, riposo, date in ora locale |
| `tests/sim.test.js` | Punti base, forza, ricalcolo a giornata calcolata |
| `tests/data.test.js` | Formazioni ereditate e semantica di «non scelta» |
| `tests/selectors.test.js` | Crediti, rose, dimensione rosa, stato asta |
| `tests/auction.test.js` | Offerta massima, guardie, vendita, annullamento |
| `tests/store.test.js` | Normalizzazione dei dati salvati, date dinamiche, nomi liberi |

Comando: `npm test`
