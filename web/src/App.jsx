import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { me } from './api'
import Header from './components/Header'
import Login from './pages/Login'
import Register from './pages/Register'
import Catalog from './pages/Catalog'
import GameDetail from './pages/GameDetail'

function RequireAuth({ user, children }) {
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default function App() {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    me()
      .then((data) => setUser(data.user))
      .finally(() => setChecking(false))
  }, [])

  const isAuthPage = !user

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
          <Route path="/login" element={<Login onLoggedIn={setUser} />} />
          <Route path="/registro" element={<Register onLoggedIn={setUser} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <>
          <Header user={user} onLoggedOut={() => setUser(null)} />
          <main>
            <Routes>
              <Route path="/" element={<RequireAuth user={user}><Catalog /></RequireAuth>} />
              <Route path="/juegos/:id" element={<RequireAuth user={user}><GameDetail /></RequireAuth>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer className="site-footer">Awakelab Marketplace &middot; Catálogo de juegos educativos</footer>
        </>
      )}
    </BrowserRouter>
  )
}
