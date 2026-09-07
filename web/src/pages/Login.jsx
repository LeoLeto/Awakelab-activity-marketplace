import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { sessionLogin } from '../api'

export default function Login({ onLoggedIn }) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const data = await sessionLogin(identifier, password)
      onLoggedIn({ type: data.type, data: data.type === 'admin' ? data.admin : data.user })
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
        {error && <div className="notice notice-error"><span>&#9888;</span><span>{error}</span></div>}
        <form onSubmit={handleSubmit}>
          <label htmlFor="identifier">Correo o usuario</label>
          <input type="text" id="identifier" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required autoFocus />
          <label htmlFor="password">Contraseña</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <p><button type="submit" className="btn-block" disabled={busy}>{busy ? 'Entrando...' : 'Entrar'}</button></p>
        </form>
        <p className="switch">¿No tienes cuenta de profesor? <Link to="/registro">Regístrate</Link></p>
      </div>
    </div>
  )
}
