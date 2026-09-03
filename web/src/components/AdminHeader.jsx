import { Link, useNavigate } from 'react-router-dom'
import { adminLogout } from '../api'

export default function AdminHeader({ admin, onLoggedOut }) {
  const navigate = useNavigate()

  async function handleLogout() {
    await adminLogout()
    onLoggedOut()
    navigate('/admin/login')
  }

  return (
    <header className="site">
      <Link to="/admin" className="brand">
        <img
          className="logo"
          src="https://media.awakelab.world/MARCA_AWK26/awakelab_logo_fondo-blanco_transparente.png"
          alt="Awakelab"
        />
      </Link>
      <nav>
        <Link to="/admin/profesores">Profesores registrados</Link>
        <button type="button" className="linklike" onClick={handleLogout}>
          Salir ({admin.username})
        </button>
      </nav>
    </header>
  )
}
