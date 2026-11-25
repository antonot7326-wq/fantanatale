import React, { useState } from 'react'
import { StoreProvider, useStore } from './store'
import SetupScreen from './screens/SetupScreen'
import PlayersScreen from './screens/PlayersScreen'
import BonusScreen from './screens/BonusScreen'
import AuctionScreen from './screens/AuctionScreen'
import LineupsScreen from './screens/LineupsScreen'
import MatchdaysScreen from './screens/MatchdaysScreen'
import StandingsScreen from './screens/StandingsScreen'
import ScorersScreen from './screens/ScorersScreen'

const TABS = [
  { id: 'setup', label: 'Setup', icon: '⚙️' },
  { id: 'players', label: 'Familiari', icon: '🎅' },
  { id: 'events', label: 'Bonus/Malus', icon: '⭐' },
  { id: 'auction', label: 'Asta', icon: '🔨' },
  { id: 'lineups', label: 'Formazioni', icon: '📋' },
  { id: 'days', label: 'Giornate', icon: '📅' },
  { id: 'standings', label: 'Classifica', icon: '🏆' },
  { id: 'scorers', label: 'Marcatori', icon: '🥇' },
]

function Shell() {
  const { state } = useStore()
  const [tab, setTab] = useState('setup')

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-title">
          <span className="logo">⚽</span>
          <div>
            <h1>{state.config.name || 'FantaNatale'}</h1>
            {state.config.host && (
              <small>
                Host: <strong>{state.config.host}</strong>
              </small>
            )}
          </div>
        </div>
        <span className="santa" aria-hidden>
          🎄
        </span>
      </header>

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span aria-hidden>{t.icon}</span> {t.label}
          </button>
        ))}
      </nav>

      <main className="content">
        {tab === 'setup' && <SetupScreen onDone={() => setTab('players')} />}
        {tab === 'players' && <PlayersScreen onDone={() => setTab('events')} />}
        {tab === 'events' && <BonusScreen onDone={() => setTab('auction')} />}
        {tab === 'auction' && <AuctionScreen onDone={() => setTab('lineups')} />}
        {tab === 'lineups' && <LineupsScreen onDone={() => setTab('days')} />}
        {tab === 'days' && <MatchdaysScreen onDone={() => setTab('standings')} />}
        {tab === 'standings' && <StandingsScreen />}
        {tab === 'scorers' && <ScorersScreen />}
      </main>

      <footer className="foot">Buon Natale e buon fantacalcio 🎁 — dati salvati solo in questo browser</footer>
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
