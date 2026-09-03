import { useEffect, useState } from 'react'
import { listGames } from '../api'
import GameCard from '../components/GameCard'

const SORTS = [
  { value: 'popular', label: 'Populares (valorados + usados)' },
  { value: 'rating', label: 'Mejor valorados' },
  { value: 'used', label: 'Más usados' },
  { value: 'published', label: 'Últimos publicados' },
]

export default function Catalog() {
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('popular')
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    listGames(q, sort)
      .then((data) => { if (!cancelled) setGames(data.games) })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [q, sort])

  function handleSubmit(e) {
    e.preventDefault()
    setQ(e.target.elements.q.value.trim())
  }

  return (
    <>
      <div className="hero">
        <div className="eyebrow">Marketplace de Awakelab</div>
        <h1>Catálogo de juegos educativos</h1>
        <p className="lead">
          Explora los juegos creados por profesores de otros colegios y reutilízalos directamente en tus cursos de
          Moodle, sin generar contenido duplicado.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card search-form">
        <div className="field">
          <label htmlFor="q">Buscar por título o tema</label>
          <input type="search" id="q" name="q" defaultValue={q} placeholder="p. ej. volcanes, fracciones, revolución francesa..." />
        </div>
        <div>
          <label htmlFor="sort">Ordenar por</label>
          <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <button type="submit">Buscar</button>
      </form>

      {error && <div className="notice notice-error"><span>&#9888;</span><span>{error}</span></div>}

      {!loading && !error && games.length === 0 && (
        <div className="card empty-state">
          <div className="icon">&#128218;</div>
          <h2 style={{ justifyContent: 'center' }}>Sin resultados</h2>
          <p>
            {q !== ''
              ? `Ningún juego coincide con "${q}". Prueba con otro término.`
              : 'Todavía no hay ningún juego publicado. En cuanto un profesor comparta uno desde Moodle, aparecerá aquí.'}
          </p>
        </div>
      )}

      {games.length > 0 && (
        <div className="game-grid">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </>
  )
}
