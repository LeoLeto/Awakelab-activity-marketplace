import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { adminMe } from './api'
import AdminHeader from './components/AdminHeader'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'

export default function AdminApp() {
  const [admin, setAdmin] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    adminMe()
      .then((data) => setAdmin(data.admin))
      .finally(() => setChecking(false))
  }, [])

  const isAuthPage = !admin

  useEffect(() => {
    document.body.classList.toggle('auth-body', isAuthPage)
  }, [isAuthPage])

  if (checking) {
    return null
  }

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="login" element={<AdminLogin onLoggedIn={setAdmin} />} />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    )
  }

  return (
    <>
      <AdminHeader admin={admin} onLoggedOut={() => setAdmin(null)} />
      <main>
        <Routes>
          <Route path="" element={<AdminDashboard admin={admin} />} />
          <Route path="profesores" element={<AdminUsers />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
      <footer className="site-footer">Awakelab Marketplace &middot; Panel de administración</footer>
    </>
  )
}
