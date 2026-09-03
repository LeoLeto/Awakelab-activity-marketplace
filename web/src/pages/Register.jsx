import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register, login } from '../api'

export default function Register({ onLoggedIn }) {
  const [name, setName] = useState('')
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
      await register(email, password, name)
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
        <h1>Crea tu cuenta</h1>
        <p className="sub">Regístrate para explorar y valorar juegos del Marketplace.</p>
        {error && <div className="notice notice-error"><span>&#9888;</span><span>{error}</span></div>}
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Nombre</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          <label htmlFor="email">Correo electrónico</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label htmlFor="password">Contraseña</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          <p className="help">Al menos 8 caracteres.</p>
          <p><button type="submit" className="btn-block" disabled={busy}>{busy ? 'Creando cuenta...' : 'Crear cuenta'}</button></p>
        </form>
        <p className="switch">¿Ya tienes cuenta? <Link to="/login">Entra</Link></p>
      </div>
    </div>
  )
}
