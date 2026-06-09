import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import StaffPortal from './pages/StaffPortal'
import Dashboard   from './components/dashboard/Dashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Staff portal — public, no login */}
        <Route path="/"          element={<StaffPortal />} />

        {/* IT dashboard — login wall handled inside Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Fallback */}
        <Route path="*" element={
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: '#6B7280' }}>Page not found. <Link to="/">Go home</Link></p>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}
