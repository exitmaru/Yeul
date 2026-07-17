import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import InfoInput from './pages/InfoInput'
import Loading from './pages/Loading'
import Result from './pages/Result'
import Auth from './pages/Auth'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/input" element={<InfoInput />} />
      <Route path="/loading" element={<Loading />} />
      <Route path="/result" element={<Result />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
