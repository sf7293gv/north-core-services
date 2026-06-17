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

import WaterDamageRestoration from './pages/services/WaterDamageRestoration'
import WaterMitigation from './pages/services/WaterMitigation'
import CarpetCleaning from './pages/services/CarpetCleaning'
import InsulationRemoval from './pages/services/InsulationRemoval'
import WhatsAppButton from './components/WhatsAppButton'

function PublicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      <WhatsAppButton />
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
          <Route path="/services/water-damage-restoration" element={<WaterDamageRestoration />} />
          <Route path="/services/water-mitigation"         element={<WaterMitigation />} />
          <Route path="/services/carpet-cleaning"          element={<CarpetCleaning />} />
          <Route path="/services/insulation-removal"       element={<InsulationRemoval />} />
        </Route>

        {/* Admin login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* /admin → redirect to /admin/dashboard */}
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
