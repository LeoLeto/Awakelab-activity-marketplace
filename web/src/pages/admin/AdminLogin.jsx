import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminLogin } from '../../api'

export default function AdminLogin({ onLoggedIn }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const data = await adminLogin(username, password)
      onLoggedIn(data.admin)
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="brand-center">
        <img src="https://media.awakelab.world/MARCA_AWK26/awakelab_logo_fondo-blanco_transparente.png" alt="Awakelab" />
      </div>
      <div className="card">
        <h1>Acceso de administración</h1>
        <p className="sub">Panel interno de Awakelab. Si es la primera vez que se usa, esta cuenta se creará automáticamente.</p>
        {error && <div className="notice notice-error"><span>&#9888;</span><span>{error}</span></div>}
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Usuario</label>
          <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
          <label htmlFor="password">Contraseña (mínimo 8 caracteres la primera vez)</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <p><button type="submit" className="btn-block" disabled={busy}>{busy ? 'Entrando...' : 'Entrar'}</button></p>
        </form>
      </div>
    </div>
  )
}
