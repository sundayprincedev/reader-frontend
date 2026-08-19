import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Library from './pages/Library'
import Reader from './pages/Reader'
import PinGate from './pages/PinGate'
import { getPin, onLockChange } from './lib/lock'

export default function App() {
  const [unlocked, setUnlocked] = useState(() => Boolean(getPin()))

  useEffect(() => onLockChange((pin) => setUnlocked(Boolean(pin))), [])

  if (!unlocked) {
    return <PinGate />
  }

  return (
    <Routes>
      <Route path="/" element={<Library />} />
      <Route path="/read/:key" element={<Reader />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
