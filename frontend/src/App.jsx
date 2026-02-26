import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useTelegram } from './hooks/useTelegram'
import { useStore } from './store/useStore'
import HomePage from './pages/client/HomePage'
import DriversPage from './pages/client/DriversPage'
import OrderTripPage from './pages/client/OrderTripPage'
import OrderParcelPage from './pages/client/OrderParcelPage'
import OrderCarPage from './pages/client/OrderCarPage'
import MyOrdersPage from './pages/client/MyOrdersPage'
import ReviewPage from './pages/client/ReviewPage'
import DriverHomePage from './pages/driver/DriverHomePage'
import DriverOrdersPage from './pages/driver/DriverOrdersPage'
import DriverProfilePage from './pages/driver/DriverProfilePage'
import AdminHomePage from './pages/admin/AdminHomePage'
import AdminDriversPage from './pages/admin/AdminDriversPage'
import AdminPricesPage from './pages/admin/AdminPricesPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import AdminStatsPage from './pages/admin/AdminStatsPage'
import Loader from './components/Loader'

function App() {
  const { initData, ready } = useTelegram()
  const { user, loading, error, initAuth } = useStore()

  useEffect(() => {
    if (initData) {
      initAuth(initData)
    }
  }, [initData, initAuth])

  if (!ready || loading) {
    return <Loader />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 text-center">
        <div>
          <p className="text-red-500 mb-2">Ошибка авторизации</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 text-center">
        <p>Откройте приложение через Telegram</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-tg-bg text-tg-text">
      <Routes>
        {/* Client routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/drivers" element={<DriversPage />} />
        <Route path="/order/trip" element={<OrderTripPage />} />
        <Route path="/order/parcel" element={<OrderParcelPage />} />
        <Route path="/order/car" element={<OrderCarPage />} />
        <Route path="/orders" element={<MyOrdersPage />} />
        <Route path="/review/:orderId" element={<ReviewPage />} />
        
        {/* Driver routes */}
        <Route path="/driver" element={<DriverHomePage />} />
        <Route path="/driver/orders" element={<DriverOrdersPage />} />
        <Route path="/driver/profile" element={<DriverProfilePage />} />
        
        {/* Admin routes */}
        <Route path="/admin" element={<AdminHomePage />} />
        <Route path="/admin/drivers" element={<AdminDriversPage />} />
        <Route path="/admin/prices" element={<AdminPricesPage />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
        <Route path="/admin/stats" element={<AdminStatsPage />} />
        
        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
