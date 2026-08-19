import { Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Reader from './pages/Reader'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/read/:key" element={<Reader />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
