import { useEffect, useState } from 'react'
import { listSchools, createSchool, toggleSchool, listAdmins, createAdmin, toggleAdmin } from '../../api'

function formatDate(unixSeconds) {
  return new Date(unixSeconds * 1000).toLocaleDateString('es-ES')
}

export default function AdminDashboard({ admin }) {
  const [schools, setSchools] = useState([])
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)

  const [schoolName, setSchoolName] = useState('')
  const [schoolError, setSchoolError] = useState('')
  const [newKey, setNewKey] = useState(null)

  const [adminUsername, setAdminUsername] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminError, setAdminError] = useState('')
  const [adminOk, setAdminOk] = useState(false)

  async function reload() {
    const [s, a] = await Promise.all([listSchools(), listAdmins()])
    setSchools(s.schools)
    setAdmins(a.admins)
  }

  useEffect(() => {
    reload().finally(() => setLoading(false))
  }, [])

  async function handleCreateSchool(e) {
    e.preventDefault()
    setSchoolError('')
    setNewKey(null)
    const name = schoolName.trim()
    if (!name) {
      setSchoolError('Ponle un nombre al colegio.')
      return
    }
    try {
      const data = await createSchool(name)
      setNewKey(data.school)
      setSchoolName('')
      await reload()
    } catch (err) {
      setSchoolError(err.message)
    }
  }

  async function handleToggleSchool(school) {
    await toggleSchool(school.id, !school.active)
    await reload()
  }

  async function handleCreateAdmin(e) {
    e.preventDefault()
    setAdminError('')
    setAdminOk(false)
    try {
      await createAdmin(adminUsername, adminPassword)
      setAdminOk(true)
      setAdminUsername('')
      setAdminPassword('')
      await reload()
    } catch (err) {
      setAdminError(err.message)
    }
  }

  async function handleToggleAdmin(a) {
    try {
      await toggleAdmin(a.id, !a.active)
      await reload()
    } catch (err) {
      setAdminError(err.message)
    }
  }

  const activeCount = schools.filter((s) => s.active).length

  if (loading) {
    return <p className="muted">Cargando...</p>
  }

  return (
    <>
      <div className="hero">
        <div className="eyebrow">Panel de administración</div>
        <h1>Colegios y claves de API</h1>
        <p className="lead">
          Cada colegio necesita su propia clave para publicar juegos en el Marketplace. Genérala aquí y pásasela a
          quien administre su Moodle.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 22 }}>
        <div className="card" style={{ flex: 1, marginBottom: 0, textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--cian-fuerte)' }}>{schools.length}</div>
          <div className="muted">Colegios totales</div>
        </div>
        <div className="card" style={{ flex: 1, marginBottom: 0, textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--cian-fuerte)' }}>{activeCount}</div>
          <div className="muted">Con clave activa</div>
        </div>
      </div>

      {newKey && (
        <div className="card" style={{ borderColor: 'rgba(15,206,211,0.35)' }}>
          <div className="notice notice-success"><span>&#10003;</span><span>Colegio "{newKey.name}" creado.</span></div>
          <p>Esta es su clave de API. <strong>Cópiala ahora</strong>: no se volverá a mostrar completa.</p>
          <p>
            <code style={{
              wordBreak: 'break-all', background: 'var(--azul-oscuro2)', border: '1px solid rgba(217,251,255,0.12)',
              padding: '12px 14px', borderRadius: 9, display: 'block', fontSize: 13, color: 'var(--cian-claro)',
            }}>{newKey.apikey}</code>
          </p>
          <p className="help">Pégala en Moodle: Administración del sitio &rarr; Complementos &rarr; Módulos de actividad &rarr; Juego Awakelab &rarr; Clave de API del Marketplace.</p>
        </div>
      )}

      <div className="card">
        <h2>&#10133; Nuevo colegio</h2>
        {schoolError && <div className="notice notice-error"><span>&#9888;</span><span>{schoolError}</span></div>}
        <form onSubmit={handleCreateSchool} style={{ display: 'flex', gap: 14, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="name">Nombre del colegio</label>
            <input type="text" id="name" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="p. ej. IES Awakelab" required />
          </div>
          <button type="submit">Generar clave</button>
        </form>
      </div>

      <div className="card">
        <h2>&#127979; Colegios existentes</h2>
        {schools.length === 0 ? (
          <div className="empty-state">
            <div className="icon">&#127979;</div>
            <p>Todavía no hay ningún colegio. Crea el primero arriba.</p>
          </div>
        ) : (
          <table>
            <thead><tr><th>Nombre</th><th>Estado</th><th>Creado</th><th /></tr></thead>
            <tbody>
              {schools.map((school) => (
                <tr key={school.id}>
                  <td>{school.name}</td>
                  <td>{school.active ? <span className="pill">&#10003; Activo</span> : <span className="pill pill-muted">Revocado</span>}</td>
                  <td className="muted">{formatDate(school.created_at)}</td>
                  <td>
                    <button type="button" className="btn-secondary btn-sm" onClick={() => handleToggleSchool(school)}>
                      {school.active ? 'Revocar' : 'Reactivar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="hero" style={{ marginTop: 40 }}>
        <div className="eyebrow">Solo para admins</div>
        <h1 style={{ fontSize: 22 }}>Administradores del Marketplace</h1>
        <p className="lead">Cuentas con acceso a este panel. Solo alguien ya logueado como admin puede crear o revocar otras cuentas de administrador.</p>
      </div>

      {adminOk && <div className="notice notice-success"><span>&#10003;</span><span>Administrador creado correctamente.</span></div>}

      <div className="card">
        <h2>&#10133; Nuevo administrador</h2>
        {adminError && <div className="notice notice-error"><span>&#9888;</span><span>{adminError}</span></div>}
        <form onSubmit={handleCreateAdmin} style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label htmlFor="admin_username">Usuario</label>
            <input type="text" id="admin_username" value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} required />
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label htmlFor="admin_password">Contraseña (mínimo 8 caracteres)</label>
            <input type="password" id="admin_password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} minLength={8} required />
          </div>
          <button type="submit">Crear administrador</button>
        </form>
      </div>

      <div className="card">
        <h2>&#128100; Administradores existentes</h2>
        <table>
          <thead><tr><th>Usuario</th><th>Estado</th><th>Creado</th><th /></tr></thead>
          <tbody>
            {admins.map((a) => {
              const isSelf = a.id === admin.id
              return (
                <tr key={a.id}>
                  <td>{a.username}{isSelf && <span className="pill pill-muted" style={{ marginLeft: 6 }}>Tú</span>}</td>
                  <td>{a.active ? <span className="pill">&#10003; Activo</span> : <span className="pill pill-muted">Revocado</span>}</td>
                  <td className="muted">{formatDate(a.created_at)}</td>
                  <td>
                    {!isSelf && (
                      <button type="button" className="btn-secondary btn-sm" onClick={() => handleToggleAdmin(a)}>
                        {a.active ? 'Revocar' : 'Reactivar'}
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
