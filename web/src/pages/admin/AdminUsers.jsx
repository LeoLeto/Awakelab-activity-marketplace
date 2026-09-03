import { useEffect, useState } from 'react'
import { listUsers } from '../../api'

function formatDate(unixSeconds) {
  return new Date(unixSeconds * 1000).toLocaleDateString('es-ES')
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listUsers().then((data) => setUsers(data.users)).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <p className="muted">Cargando...</p>
  }

  return (
    <>
      <div className="hero">
        <div className="eyebrow">Panel de administración</div>
        <h1>Profesores registrados</h1>
        <p className="lead">Cuentas de la web del Marketplace que pueden explorar y reutilizar el catálogo. Solo lectura por ahora.</p>
      </div>

      <div className="card" style={{ marginBottom: 0 }}>
        <div style={{ marginBottom: 14 }}>
          <span className="pill">{users.length} registrados</span>
        </div>
        {users.length === 0 ? (
          <div className="empty-state">
            <div className="icon">&#128101;</div>
            <p>Todavía no se ha registrado ningún profesor.</p>
          </div>
        ) : (
          <table>
            <thead><tr><th>Nombre</th><th>Correo</th><th>Registrado</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td className="muted">{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
