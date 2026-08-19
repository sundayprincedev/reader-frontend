import { Navigate, Route, Routes } from 'react-router-dom'
import Library from './pages/Library'
import Reader from './pages/Reader'
import SignIn from './pages/SignIn'
import Spinner from './components/Spinner'
import { useAuth } from './hooks/useAuth'

export default function App() {
  const { status } = useAuth()

  if (status === 'loading') {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (status === 'signed-out') {
    return <SignIn />
  }

  return (
    <Routes>
      <Route path="/" element={<Library />} />
      <Route path="/read/:key" element={<Reader />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
