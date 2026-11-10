import Minesweeper from './components/Minesweeper'
import './App.css'

function App() {
  return (
    <main className="site-shell">
      <header className="site-header">
        <a className="brand" href="#" aria-label="Mezőnyitó főoldal">
          <span className="brand-mark" aria-hidden="true">M</span>
          <span>mezőnyitó</span>
        </a>
        <span className="header-note">A klasszikus, egy kis csavarral</span>
      </header>
      <Minesweeper />
      <footer className="site-footer">Egy nyugodt perc, mielőtt továbbmész.</footer>
    </main>
  )
}

export default App
