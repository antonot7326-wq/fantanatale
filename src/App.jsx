import React, { useState } from 'react'
import { StateProvider, useApp } from './state/store'
import MenuScreen from './screens/MenuScreen'
import SetupScreen from './screens/SetupScreen'
import PlayersScreen from './screens/PlayersScreen'
import RulesScreen from './screens/RulesScreen'
import AuctionScreen from './screens/AuctionScreen'
import LineupsScreen from './screens/LineupsScreen'
import MatchdaysScreen from './screens/MatchdaysScreen'
import StandingsScreen from './screens/StandingsScreen'

const VIEWS = {
  menu: MenuScreen,
  setup: SetupScreen,
  players: PlayersScreen,
  rules: RulesScreen,
  auction: AuctionScreen,
  lineups: LineupsScreen,
  matchdays: MatchdaysScreen,
  standings: StandingsScreen,
}

function Shell() {
  const { state } = useApp()
  const [view, setView] = useState('menu')
  const View = VIEWS[view] ?? MenuScreen

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>{state.config.name || 'FantaNatale'}</h1>
          {state.config.host && <small>Responsabile delle giornate: {state.config.host}</small>}
        </div>
      </header>

      <View onNavigate={setView} onBack={() => setView('menu')} />

      <footer className="footer">
        I dati di gioco restano in questo telefono, nel browser. Usa «Esporta» nelle Impostazioni per spostarli.
      </footer>
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
