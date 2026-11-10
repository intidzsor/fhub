type Cell = {
  mine: boolean
  revealed: boolean
  flagged: boolean
  adjacent: number
  exploded?: boolean
}

type Props = {
  board: Cell[]
  size: number
  status: 'ready' | 'playing' | 'won' | 'lost'
  onOpen: (index: number) => void
  onToggleFlag: (index: number) => void
}

const numberNames = ['üres', 'egy', 'kettő', 'három', 'négy', 'öt', 'hat', 'hét', 'nyolc']

function MinesweeperBoard({ board, size, status, onOpen, onToggleFlag }: Props) {
  return (
    <div
      className={`mine-board ${status}`}
      style={{ '--board-size': size } as React.CSSProperties}
      role="grid"
      aria-label={`${size} x ${size} mezős aknakereső tábla`}
    >
      {board.map((cell, index) => {
        const label = cell.flagged
          ? 'Zászlóval jelölt mező'
          : cell.revealed
            ? cell.mine
              ? 'Aknát tartalmazó mező'
              : `${numberNames[cell.adjacent]} szomszédos akna`
            : 'Rejtett mező'

        return (
          <button
            key={index}
            type="button"
            className={[
              'mine-cell',
              cell.revealed ? 'revealed' : '',
              cell.flagged ? 'flagged' : '',
              cell.exploded ? 'exploded' : '',
              cell.revealed && !cell.mine && cell.adjacent ? `number-${cell.adjacent}` : '',
            ].filter(Boolean).join(' ')}
            role="gridcell"
            aria-label={label}
            onClick={() => onOpen(index)}
            onContextMenu={(event) => {
              event.preventDefault()
              onToggleFlag(index)
            }}
            disabled={(status === 'won' || status === 'lost') && !cell.flagged}
          >
            {cell.flagged ? '⚑' : cell.revealed ? cell.mine ? '✹' : cell.adjacent || '' : ''}
          </button>
        )
      })}
    </div>
  )
}

export default MinesweeperBoard