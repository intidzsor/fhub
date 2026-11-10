import { useEffect, useState } from 'react'
import MinesweeperBoard from './MinesweeperBoard'

type Difficulty = 'easy' | 'medium' | 'hard'
type GameStatus = 'ready' | 'playing' | 'won' | 'lost'
type Cell = {
  mine: boolean
  revealed: boolean
  flagged: boolean
  adjacent: number
  exploded?: boolean
}

const levels: Record<Difficulty, { label: string; size: number; mines: number }> = {
  easy: { label: 'Kezdő', size: 9, mines: 10 },
  medium: { label: 'Haladó', size: 12, mines: 22 },
  hard: { label: 'Szakértő', size: 16, mines: 40 },
}

function emptyBoard(size: number): Cell[] {
  return Array.from({ length: size * size }, () => ({
    mine: false,
    revealed: false,
    flagged: false,
    adjacent: 0,
  }))
}

function neighbors(index: number, size: number): number[] {
  const row = Math.floor(index / size)
  const column = index % size
  const nearby: number[] = []

  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
      const nextRow = row + rowOffset
      const nextColumn = column + columnOffset
      if (
        (rowOffset !== 0 || columnOffset !== 0) &&
        nextRow >= 0 && nextRow < size &&
        nextColumn >= 0 && nextColumn < size
      ) {
        nearby.push(nextRow * size + nextColumn)
      }
    }
  }

  return nearby
}

function createBoard(size: number, mineCount: number, safeIndex: number, flags: Cell[]): Cell[] {
  const board = emptyBoard(size)
  let placed = 0

  while (placed < mineCount) {
    const index = Math.floor(Math.random() * board.length)
    if (index !== safeIndex && !board[index].mine) {
      board[index].mine = true
      placed += 1
    }
  }

  board.forEach((cell, index) => {
    cell.flagged = flags[index].flagged
    if (!cell.mine) {
      cell.adjacent = neighbors(index, size).filter((neighbor) => board[neighbor].mine).length
    }
  })

  return board
}

function reveal(board: Cell[], start: number, size: number): Cell[] {
  const next = board.map((cell) => ({ ...cell }))
  const pending = [start]

  while (pending.length > 0) {
    const index = pending.pop()!
    const cell = next[index]
    if (cell.revealed || cell.flagged) continue
    cell.revealed = true

    if (cell.adjacent === 0 && !cell.mine) {
      neighbors(index, size).forEach((neighbor) => {
        if (!next[neighbor].revealed && !next[neighbor].flagged) pending.push(neighbor)
      })
    }
  }

  return next
}

function Minesweeper() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [mineCount, setMineCount] = useState(levels.easy.mines)
  const [board, setBoard] = useState(() => emptyBoard(levels.easy.size))
  const [status, setStatus] = useState<GameStatus>('ready')
  const [seconds, setSeconds] = useState(0)
  const { size } = levels[difficulty]
  const flagsLeft = mineCount - board.filter((cell) => cell.flagged).length

  useEffect(() => {
    if (status !== 'playing') return
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [status])

  function reset(nextDifficulty = difficulty, nextMineCount = mineCount) {
    setDifficulty(nextDifficulty)
    setMineCount(nextMineCount)
    setBoard(emptyBoard(levels[nextDifficulty].size))
    setStatus('ready')
    setSeconds(0)
  }

  function changeMineCount(value: number) {
    if (!Number.isInteger(value) || value < 1 || value >= size * size) return
    reset(difficulty, value)
  }

  function openCell(index: number) {
    if (status === 'won' || status === 'lost' || board[index].flagged || board[index].revealed) return

    const workingBoard = status === 'ready'
      ? createBoard(size, mineCount, index, board)
      : board
    const next = reveal(workingBoard, index, size)

    if (next[index].mine) {
      next[index].exploded = true
      next.forEach((cell) => {
        if (cell.mine) cell.revealed = true
      })
      setBoard(next)
      setStatus('lost')
      return
    }

    const revealedSafeCells = next.filter((cell) => cell.revealed && !cell.mine).length
    setBoard(next)
    setStatus(revealedSafeCells === size * size - mineCount ? 'won' : 'playing')
  }

  function toggleFlag(index: number) {
    if (status === 'won' || status === 'lost' || board[index].revealed) return
    const next = board.map((cell) => ({ ...cell }))
    if (!next[index].flagged && flagsLeft <= 0) return
    next[index].flagged = !next[index].flagged
    setBoard(next)
  }

  const statusText = status === 'won'
    ? 'Szép munka, megtisztítottad a pályát!'
    : status === 'lost'
      ? 'Bumm! Próbáld meg még egyszer.'
      : status === 'playing'
        ? 'Jól haladsz. Figyeld a számokat!'
        : 'Kattints egy mezőre a kezdéshez.'

  return (
    <section className="game-section" aria-labelledby="game-title">
      <div className="game-intro">
        <p className="eyebrow">A napi fejtörő</p>
        <h1 id="game-title">Minesweeper<span>.</span></h1>
        <p className="intro-copy">Találd meg az üres mezőket, és kerüld el az aknákat.</p>
      </div>

      <div className="game-panel">
        <div className="game-controls">
          <label className="difficulty-control">
            <span>Nehézség</span>
            <select
              value={difficulty}
              onChange={(event) => {
                const nextDifficulty = event.target.value as Difficulty
                reset(nextDifficulty, levels[nextDifficulty].mines)
              }}
              aria-label="Nehézségi fokozat"
            >
              {Object.entries(levels).map(([key, level]) => (
                <option key={key} value={key}>{level.label}</option>
              ))}
            </select>
          </label>
          <label className="difficulty-control mine-count-control">
            <span>Bombák száma</span>
            <input
              type="number"
              min={1}
              max={size * size - 1}
              value={mineCount}
              onChange={(event) => changeMineCount(event.currentTarget.valueAsNumber)}
              aria-label="Bombák száma"
            />
          </label>
          <button className="restart-button" type="button" onClick={() => reset()}>
            Új játék
          </button>
        </div>

        <div className="game-statusbar" aria-live="polite">
          <div className="stat-item">
            <span className="stat-icon mine-icon" aria-hidden="true">✹</span>
            <span className="stat-label">Aknák</span>
            <strong>{String(Math.max(0, flagsLeft)).padStart(2, '0')}</strong>
          </div>
          <div className="mood-indicator" aria-label={statusText}>
            <span aria-hidden="true">{status === 'won' ? '😎' : status === 'lost' ? '😵' : '🙂'}</span>
          </div>
          <div className="stat-item timer-stat">
            <span className="stat-icon timer-icon" aria-hidden="true">◷</span>
            <span className="stat-label">Idő</span>
            <strong>{String(Math.min(seconds, 999)).padStart(3, '0')}</strong>
          </div>
        </div>

        <MinesweeperBoard
          board={board}
          size={size}
          status={status}
          onOpen={openCell}
          onToggleFlag={toggleFlag}
        />

        <p className={`game-message ${status}`} aria-live="polite">{statusText}</p>
      </div>
      <p className="keyboard-hint">Bal klikk: mező felfedése <span>·</span> Jobb klikk: zászló</p>
    </section>
  )
}

export default Minesweeper