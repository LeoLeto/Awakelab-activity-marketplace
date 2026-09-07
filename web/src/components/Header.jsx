import { Link, NavLink, useNavigate } from 'react-router-dom'
import { sessionLogout } from '../api'

export default function Header({ session, onLoggedOut }) {
  const navigate = useNavigate()
  const isAdmin = session.type === 'admin'

  async function handleLogout() {
    await sessionLogout()
    onLoggedOut()
    navigate('/login')
  }

  return (
    <header className="site">
      <Link to="/" className="brand">
        <img
          className="logo"
          src="https://media.awakelab.world/MARCA_AWK26/awakelab_logo_fondo-blanco_transparente.png"
          alt="Awakelab"
        />
      </Link>
      {isAdmin && (
        <nav className="tabs">
          <NavLink to="/" end className={({ isActive }) => 'tab' + (isActive ? ' tab-active' : '')}>Marketplace</NavLink>
          <NavLink to="/admin" className={({ isActive }) => 'tab' + (isActive ? ' tab-active' : '')}>Panel de admin</NavLink>
        </nav>
      )}
      <nav>
        {isAdmin && <Link to="/admin/profesores">Profesores registrados</Link>}
        <button type="button" className="linklike" onClick={handleLogout}>
          Salir ({isAdmin ? session.data.username : session.data.name})
        </button>
      </nav>
    </header>
  )
}
