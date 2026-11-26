import React, { Component, useEffect, useRef, useState } from 'react'
import { StateProvider, useApp } from './state/store'
import { DialogProvider } from './ui/dialog'
import HomeScreen from './screens/HomeScreen'
import RoseScreen from './screens/RoseScreen'
import AuctionScreen from './screens/AuctionScreen'
import LineupsScreen from './screens/LineupsScreen'
import MatchdaysScreen from './screens/MatchdaysScreen'
import StandingsScreen from './screens/StandingsScreen'
import GuestScreen from './screens/GuestScreen'
import SetupScreen from './screens/SetupScreen'
import RulesScreen from './screens/RulesScreen'
import { IconHome, IconTeams, IconAuction, IconCalendar, IconTrophy, IconGear, IconSun, IconMoon } from './ui/icons'

const THEME_KEY = 'fantanatale-theme'

function preferredTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'dark' || saved === 'light') return saved
  } catch {
    /* navigazione privata o storage bloccato */
  }
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

// Dove porta "Indietro" da ogni pagina secondaria (B12).
const BACK = { setup: 'home', rules: 'setup', lineups: 'home' }

const viewFromHash = () => {
  const id = window.location.hash.replace(/^#\/?/, '')
  return VIEWS[id] ? id : 'home'
}

// Se qualcosa va storto, l'app non sparisce: messaggio chiaro e pulsante Ricarica (A1).
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="app">
          <div className="content">
            <div className="card" style={{ marginTop: '2rem' }}>
              <h2 style={{ marginTop: 0 }}>Qualcosa non ha funzionato</h2>
              <p className="note">
                I dati della lega sono al sicuro in questo telefono. Ricarica la pagina per continuare a giocare.
              </p>
              <div className="btn-row">
                <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
                  Ricarica
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function Shell() {
  const { state, update } = useApp()
  const [view, setView] = useState(viewFromHash)
  const [theme, setTheme] = useState(preferredTheme)
  const hasController = useRef(Boolean(navigator.serviceWorker?.controller))

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#131a15' : '#12a05f')
  }, [theme])

  useEffect(() => {
    const onHash = () => {
      setView(viewFromHash())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    if (!navigator.serviceWorker) return
    const onController = () => {
      if (!hasController.current) {
        hasController.current = true
        return
      }
      window.location.reload()
    }
    navigator.serviceWorker.addEventListener('controllerchange', onController)
    return () => navigator.serviceWorker.removeEventListener('controllerchange', onController)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      /* navigazione privata: il tema resta solo per la sessione */
    }
    setTheme(next)
  }

  const navigate = (id) => {
    window.location.hash = VIEWS[id] ? `#/${id}` : '#/home'
  }

  const secondary = view === 'setup' || view === 'rules' || view === 'lineups'
  const View = VIEWS[view] ?? HomeScreen
  const netOn = state.net.enabled

  // Modalità ospite: solo nome della lega e classifica, aggiornati da soli.
  if (netOn && state.net.role === 'guest') {
    return (
      <GuestScreen
        onExit={() => update((s) => ({ ...s, net: { ...s.net, enabled: false, role: 'admin' } }))}
      />
    )
  }

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
          onClick={() => navigate('setup')}
          aria-label="Impostazioni"
        >
          <IconGear />
        </button>
      </header>

      <div className="content">
        <View onNavigate={navigate} onBack={() => navigate(BACK[view] ?? 'home')} />
      </div>

      <footer className="footer">
        {netOn
          ? 'I dati sono collegati tra i telefoni della lega.'
          : 'I dati restano in questo telefono. Usa «Esporta» nelle Impostazioni per spostarli.'}
      </footer>

      <nav className="tabbar" aria-label="Navigazione principale">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={`tab ${view === id || (secondary && id === 'home') ? 'active' : ''}`}
            aria-current={view === id ? 'page' : undefined}
            onClick={() => navigate(id)}
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
    <ErrorBoundary>
      <StateProvider>
        <DialogProvider>
          <Shell />
        </DialogProvider>
      </StateProvider>
    </ErrorBoundary>
  )
}
