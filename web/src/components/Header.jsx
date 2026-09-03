import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../api'

export default function Header({ user, onLoggedOut }) {
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
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
      {user && (
        <nav>
          <button type="button" className="linklike" onClick={handleLogout}>
            Salir ({user.name})
          </button>
        </nav>
      )}
    </header>
  )
}
