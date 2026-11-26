import React, { useEffect, useState } from 'react'
import { StateProvider, useApp } from './state/store'
import HomeScreen from './screens/HomeScreen'
import RoseScreen from './screens/RoseScreen'
import AuctionScreen from './screens/AuctionScreen'
import LineupsScreen from './screens/LineupsScreen'
import MatchdaysScreen from './screens/MatchdaysScreen'
import StandingsScreen from './screens/StandingsScreen'
import SetupScreen from './screens/SetupScreen'
import RulesScreen from './screens/RulesScreen'
import { IconHome, IconTeams, IconAuction, IconCalendar, IconTrophy, IconGear, IconSun, IconMoon } from './ui/icons'

const THEME_KEY = 'fantanatale-theme'

function preferredTheme() {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'dark' || saved === 'light') return saved
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const TABS = [
  { id: 'home', label: 'Home', Icon: IconHome },
  { id: 'teams', label: 'Rose', Icon: IconTeams },
  { id: 'auction', label: 'Asta', Icon: IconAuction },
  { id: 'matchdays', label: 'Giornate', Icon: IconCalendar },
  { id: 'standings', label: 'Classifica', Icon: IconTrophy },
]

const VIEWS = {
  home: HomeScreen,
  teams: RoseScreen,
  auction: AuctionScreen,
  matchdays: MatchdaysScreen,
  standings: StandingsScreen,
  setup: SetupScreen,
  rules: RulesScreen,
  lineups: LineupsScreen,
}

function Shell() {
  const { state } = useApp()
  const [view, setView] = useState('home')
  const [theme, setTheme] = useState(preferredTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem(THEME_KEY, next)
    setTheme(next)
  }
  const View = VIEWS[view] ?? HomeScreen
  const onNavigate = (id) => setView(VIEWS[id] ? id : 'home')
  const secondary = view === 'setup' || view === 'rules' || view === 'lineups'

  return (
    <div className="app">
      <header className="topbar">
        <span className="topbar-logo" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l1.9 5.7H20l-4.7 3.5 1.8 5.8L12 13.5 6.9 17l1.8-5.8L4 7.7h6.1L12 2z" />
          </svg>
        </span>
        <div className="topbar-title">
          <h1>{state.config.name || 'FantaNatale'}</h1>
        </div>
        <button
          type="button"
          className="icon-btn"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Passa al tema chiaro' : 'Passa al tema scuro'}
          title="Tema chiaro / scuro"
        >
          {theme === 'dark' ? <IconSun /> : <IconMoon />}
        </button>
        <button
          type="button"
          className={`icon-btn ${view === 'setup' ? 'active' : ''}`}
          onClick={() => setView('setup')}
          aria-label="Impostazioni"
        >
          <IconGear />
        </button>
      </header>

      <div className="content">
        <View onNavigate={onNavigate} onBack={() => setView('home')} />
      </div>

      <footer className="footer">
        I dati restano in questo telefono. Usa «Esporta» nelle Impostazioni per spostarli.
      </footer>

      <nav className="tabbar" aria-label="Navigazione principale">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={`tab ${view === id || (secondary && id === 'home') ? 'active' : ''}`}
            aria-current={view === id ? 'page' : undefined}
            onClick={() => setView(id)}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

export default function App() {
  return (
    <StateProvider>
      <Shell />
    </StateProvider>
  )
}
