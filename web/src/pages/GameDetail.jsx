import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getGame, rateGame } from '../api'
import StarRating from '../components/StarRating'

function formatDate(unixSeconds) {
  return new Date(unixSeconds * 1000).toLocaleDateString('es-ES')
}

export default function GameDetail({ session }) {
  const { id } = useParams()
  const canRate = session.type === 'teacher'
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ratedState, setRatedState] = useState('')
  const [submittingStars, setSubmittingStars] = useState(0)
  const [myStars, setMyStars] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setRatedState('')
    setMyStars(0)
    getGame(id)
      .then((data) => { if (!cancelled) setGame(data.game) })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  async function handleRate(stars) {
    setSubmittingStars(stars)
    try {
      await rateGame(id, stars)
      const data = await getGame(id)
      setGame(data.game)
      setMyStars(stars)
      setRatedState('ok')
    } catch {
      setRatedState('error')
    } finally {
      setSubmittingStars(0)
    }
  }

  if (loading) {
    return <p className="muted">Cargando...</p>
  }

  if (error || !game) {
    return (
      <>
        <h1>No encontrado</h1>
        <div className="notice notice-error"><span>&#9888;</span><span>Ese juego no existe o ha sido retirado.</span></div>
        <p><Link to="/">&larr; Volver al catálogo</Link></p>
      </>
    )
  }

  const avgRating = game.avg_rating !== null && game.avg_rating !== undefined
    ? Math.round(game.avg_rating * 10) / 10
    : null
  const ratingCount = game.rating_count || 0
  const timesUsed = game.times_used || 0

  return (
    <>
      <div className="hero">
        <div className="eyebrow">Ficha del juego</div>
        <h1>{game.title}</h1>
        <div className="meta" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          <span className="pill pill-muted">&#127979; {game.school_name}</span>
          {game.subject && <span className="pill">{game.subject}</span>}
          <span className="pill pill-muted">Actualizado el {formatDate(game.updated_at)}</span>
          <span className="pill">&#9733; {avgRating !== null ? `${avgRating} (${ratingCount})` : 'Sin valoraciones'}</span>
          <span className="pill pill-muted">Usado {timesUsed} {timesUsed === 1 ? 'vez' : 'veces'}</span>
        </div>
      </div>

      {canRate && ratedState === 'ok' && <div className="notice notice-success"><span>&#10003;</span><span>¡Gracias por tu valoración!</span></div>}
      {canRate && ratedState === 'error' && <div className="notice notice-error"><span>&#9888;</span><span>No se pudo guardar la valoración.</span></div>}

      {canRate && (
        <div className="card">
          <h2>&#11088; Valora este juego</h2>
          <StarRating value={myStars} onChange={handleRate} disabled={submittingStars > 0} />
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--borde)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff6b6b', display: 'inline-block' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffd166', display: 'inline-block' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#19F7F1', display: 'inline-block' }} />
          <span className="muted" style={{ marginLeft: 6 }}>Vista previa</span>
        </div>
        <iframe
          srcDoc={game.html}
          sandbox="allow-scripts allow-same-origin"
          style={{ width: '100%', minHeight: 600, border: 0, background: '#fff', display: 'block' }}
          title={game.title}
        />
      </div>

      <p className="muted">Para usar este juego en tu curso, ve a Moodle, crea una actividad "Juego Awakelab" y elige "Usar del Marketplace".</p>
    </>
  )
}
