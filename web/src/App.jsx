import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { sessionMe } from './api'
import Header from './components/Header'
import Login from './pages/Login'
import Register from './pages/Register'
import Catalog from './pages/Catalog'
import GameDetail from './pages/GameDetail'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'

export default function App() {
  const [session, setSession] = useState(null) // null | { type: 'admin'|'teacher', data }
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    sessionMe()
      .then((data) => {
        if (data.type === 'admin') {
          setSession({ type: 'admin', data: data.admin })
        } else if (data.type === 'teacher') {
          setSession({ type: 'teacher', data: data.user })
        } else {
          setSession(null)
        }
      })
      .finally(() => setChecking(false))
  }, [])

  const isAuthPage = !session

  useEffect(() => {
    document.body.classList.toggle('auth-body', isAuthPage)
  }, [isAuthPage])

  if (checking) {
    return null
  }

  return (
    <BrowserRouter>
      {isAuthPage ? (
        <Routes>
          <Route path="/login" element={<Login onLoggedIn={setSession} />} />
          <Route path="/registro" element={<Register onLoggedIn={setSession} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <>
          <Header session={session} onLoggedOut={() => setSession(null)} />
          <main>
            <Routes>
              <Route path="/" element={<Catalog />} />
              <Route path="/juegos/:id" element={<GameDetail session={session} />} />
              {session.type === 'admin' && (
                <>
                  <Route path="/admin" element={<AdminDashboard admin={session.data} />} />
                  <Route path="/admin/profesores" element={<AdminUsers />} />
                </>
              )}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer className="site-footer">Awakelab Marketplace &middot; Catálogo de juegos educativos</footer>
        </>
      )}
    </BrowserRouter>
  )
}
