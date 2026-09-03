import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api'

export default function Login({ onLoggedIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const data = await login(email, password)
      onLoggedIn(data.user)
      navigate('/')
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
        <h1>Accede al Marketplace</h1>
        <p className="sub">Explora y valora juegos educativos de otros colegios.</p>
        {error && <div className="notice notice-error"><span>&#9888;</span><span>{error}</span></div>}
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Correo electrónico</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label htmlFor="password">Contraseña</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <p><button type="submit" className="btn-block" disabled={busy}>{busy ? 'Entrando...' : 'Entrar'}</button></p>
        </form>
        <p className="switch">¿No tienes cuenta? <Link to="/registro">Regístrate</Link></p>
      </div>
    </div>
  )
}
