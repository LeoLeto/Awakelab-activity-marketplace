import { useState } from 'react'
import { Link } from 'react-router-dom'

function formatDate(unixSeconds) {
  return new Date(unixSeconds * 1000).toLocaleDateString('es-ES')
}

export default function GameCard({ game }) {
  const [thumbFailed, setThumbFailed] = useState(false)
  const avgRating = game.avg_rating !== null && game.avg_rating !== undefined
    ? Math.round(game.avg_rating * 10) / 10
    : null

  return (
    <Link className="game-card" to={`/juegos/${game.id}`}>
      <div className="thumb">
        {thumbFailed ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.5 3.5a1.75 1.75 0 1 1 3.5 0V5h2.25A1.25 1.25 0 0 1 16.5 6.25V8.5h1.25a1.75 1.75 0 1 1 0 3.5H16.5v2.25a1.25 1.25 0 0 1-1.25 1.25H13v1.25a1.75 1.75 0 1 1-3.5 0V15.5H7.25A1.25 1.25 0 0 1 6 14.25V12H4.75a1.75 1.75 0 1 1 0-3.5H6V6.25A1.25 1.25 0 0 1 7.25 5H9.5V3.5Z" />
          </svg>
        ) : (
          <img src={`/thumbs/${game.id}.png`} alt="" onError={() => setThumbFailed(true)} />
        )}
      </div>
      <div className="body">
        <h3>{game.title}</h3>
        <div className="meta">
          {game.subject && <span className="pill">{game.subject}</span>}
          <span className="pill pill-muted">{game.school_name}</span>
          <span className="pill">&#9733; {avgRating !== null ? avgRating : '—'}</span>
          <span className="pill pill-muted">Usado {game.times_used || 0}</span>
        </div>
        <div className="spacer" />
        <div className="foot">
          <span className="muted">Actualizado {formatDate(game.updated_at)}</span>
          <span className="btn btn-secondary btn-sm">Ver &rarr;</span>
        </div>
      </div>
    </Link>
  )
}
