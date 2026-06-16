import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Services from './components/Services'
import WhyUs from './components/WhyUs'
import Contact from './components/Contact'
import Footer from './components/Footer'

import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import BookingsManager from './pages/admin/BookingsManager'
import PhotosManager from './pages/admin/PhotosManager'
import AdminSettings from './pages/admin/AdminSettings'

function PublicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public site */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<><Hero /><Services /><WhyUs /><Contact /></>} />
        </Route>

        {/* Admin login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* /admin → redirect to /admin/dashboard (ProtectedRoute handles auth → /admin/login) */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Protected admin panel */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="bookings"  element={<BookingsManager />} />
          <Route path="photos"    element={<PhotosManager />} />
          <Route path="settings"  element={<AdminSettings />} />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}
