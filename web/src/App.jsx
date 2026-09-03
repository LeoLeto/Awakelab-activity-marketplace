import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TeacherApp from './TeacherApp'
import AdminApp from './AdminApp'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/*" element={<TeacherApp />} />
      </Routes>
    </BrowserRouter>
  )
}
